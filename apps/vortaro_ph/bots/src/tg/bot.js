import fs from 'fs';

import dotenv from 'dotenv';
import {loggers} from 'winston';
import { v4 as uuidv4 } from 'uuid';
import Polyglot from 'node-polyglot';
import {Logger} from '../logger';
import { Telegraf, Markup, Extra } from 'telegraf';

import TgLocalSession from 'telegraf-session-local';

import { Common } from '../common';

function main() {
    dotenv.config();

    const loggerObj = Logger.createNewLogger('tg');
    const logger = loggerObj.loggerObj;

    process.env.SHARED_LOGGER_ID = loggerObj.id;

    const botObj = new Telegraf(process.env.TG_CLIENT_TOKEN);
    const sessionObj = new TgLocalSession({
        database: 'session/user_pref.json'
    });

    // Middlewares
    botObj.use(sessionObj.middleware())
    .use(async (ctx, next) => {
        const langCode = (ctx.session.sessionLang != null) ? ctx.session.sessionLang : 'eo';

        const returnObj = await Common.switchLang(langCode);
        const localeObj = new Polyglot({
            phrases: returnObj.localeObj,
            locale: langCode
        });
        ctx.i18n = localeObj;

        return next().then(() => {
            if(ctx.session != null) {
                ctx.session.sessionLang = ctx.i18n.locale()
            }
        });
    });

    // Set default commands
    botObj.start(async (ctx) => {
        logger.debug(`Received /start action from userid ${ctx.from.id}`);

        await ctx.telegram.setMyCommands([
            {command: 'start', description: ctx.i18n.t('help.startTg')},
            {command: 'help', description: ctx.i18n.t('help.showHelp')},
            {command: 'about', description: ctx.i18n.t('help.showAbout')},
            {command: 'search', description: ctx.i18n.t('help.search')},
        ]);

        const keyboardMarkupExtra = Markup.inlineKeyboard([
                [Markup.callbackButton(`🔍 ${ctx.i18n.t('general.buttons.search')}`, 'search_again')],
                [
                    Markup.callbackButton(`⚙ ${ctx.i18n.t('general.buttons.settings')}`, 'settings'),
                    Markup.callbackButton(`❓ ${ctx.i18n.t('general.buttons.help')}`, 'help'),
                    Markup.callbackButton(`ℹ ${ctx.i18n.t('general.buttons.about')}`, 'about')
                ]
            ])
            .oneTime()
            .resize()
            .extra();

        await ctx.reply(ctx.i18n.t('general.welcome'), keyboardMarkupExtra);
    })
    
    // Set other commands
    botObj.help(async (ctx) => {
        logger.info(`Received /help command from userid ${ctx.from.id}`);

        await ctx.reply(getHelpText(ctx), Extra.markdown());
    })
    .command('about', async (ctx) => {
        logger.info(`Received /about command from userid ${ctx.from.userid}`);

        await ctx.reply(getAboutText(ctx), Extra.markdown());
    })
    .command('search', async(ctx) => {
        logger.info(`Received /search command from userid ${ctx.from.userid}`);

        const keyboardMarkupExtra = Markup.inlineKeyboard([
            [
                Markup.callbackButton(ctx.i18n.t('general.lang.en'), 'search_en'),
                Markup.callbackButton(ctx.i18n.t('general.lang.eo'), 'search_eo')
            ],
            [Markup.callbackButton(`◀ ${ctx.i18n.t('general.buttons.back')}`, 'start')]
        ])
        .oneTime()
        .extra();

        ctx.session.isSearching = false;

        await ctx.reply(ctx.i18n.t('search.searchLangReply'), keyboardMarkupExtra);
    });

    // Set actions
    initActions(botObj, logger);
    /*
    .action('search_eo', async (ctx) => {
        ctx.session.isSearching = true;
        ctx.session.searchTermLocale = 'eo';

        logger.info(`Search in ${ctx.session.searchTermLocale} ${ctx.session.chatId}`);

        await ctx.answerCbQuery();
        await ctx.editMessageText(`Please reply with your Esperanto word.`);
    });
    */

    // Set message actions
    botObj.on('text', async (ctx) => {
        if(ctx.session.isSearching != true) {
            return;
        }

        let localCap = ctx.i18n.locale();
        localCap = localCap.charAt(0).toUpperCase() + localCap.slice(1).toLowerCase();

        ctx.session.isSearching = false;

        const chatId = ctx.session.chatId;
        let searchTerm = ctx.message.text;
        const searchTermLocale = ctx.session.searchTermLocale;

        // await ctx.replyWithMarkdown(ctx.i18n.t(`search.search${localCap}`, { searchTerm: searchTerm }));

        if(searchTermLocale == 'eo') {
            searchTerm = Common.asciiToHats(ctx.message.text);
        }

        const keyboardMarkupExtra = Markup.inlineKeyboard([
            Markup.callbackButton(`🔍 ${ctx.i18n.t('general.buttons.searchAgain')}`, 'search_renew')
        ])
        .oneTime()
        .extra();

        try {
            const defsArr = await Common.findFromDictionary(searchTerm, searchTermLocale);

            logger.info(`Found ${defsArr.length} definitions of term ${searchTerm} from ${searchTermLocale}.`);

            if(defsArr.length <= 0) {
                await ctx.replyWithMarkdown(ctx.i18n.t('search.notFound', {searchTerm: searchTerm}), keyboardMarkupExtra);
            }
            else {
                let nextMsg = ctx.i18n.t('search.found', {smart_count: defsArr.length, searchTerm: searchTerm});
                nextMsg += '\n';
    
                defsArr.forEach((def, i) => {
                    nextMsg += `\n**[${i + 1}]: ${def[0]}** - ${def[1]}`;
                });
    
                await ctx.replyWithMarkdown(nextMsg, keyboardMarkupExtra);
            }
        }
        catch(error) {
            logger.error(`Error while searching term ${searchTerm}: ${error}`);

            await ctx.replyWithMarkdown(chatId, ctx.i18n.t('search.noSearch'), keyboardMarkupExtra);
        }
    });

    // Set inline query handling
    botObj.on('inline_query', async (ctx) => {
        const query = ctx.inlineQuery.query.split(' ', 2).map((d) => { return d.trim(); });

        if(query.length != 2) {
            await ctx.answerInlineQuery();
            return;
        }

        if(['en', 'eo'].indexOf(query[0]) < 0) {
            await ctx.answerInlineQuery();
            return;
        }

        const searchTermLocale = query[0];
        let searchTerm = query[1];

        if(searchTermLocale == 'eo') {
            searchTerm = Common.asciiToHats(searchTerm);
        }

        const defsArr = await Common.findFromDictionary(searchTerm, searchTermLocale);

        logger.info(`Found ${defsArr.length} definitions of term ${searchTerm} from ${searchTermLocale}.`);

        if(defsArr.length <= 0) {
            await ctx.answerInlineQuery();
        }
        else {
            const defResults = defsArr.map((def) => {
                const defText = `**${def[0]}** - ${def[1]}`;

                return {
                    type: 'article',
                    id: uuidv4(),
                    title: defText,
                    input_message_content: {
                        message_text: defText,
                        parse_mode: 'Markdown'
                    }
                };
            });

            await ctx.answerInlineQuery(defResults);
        }
    });

    botObj.catch((err, ctx) => {
        logger.error(`Generic caught for updateType ${ctx.updateType}: ${err}`);
    });

    botObj.launch()
        .then(async () => {
            logger.info('TG bot launched successfully!');

            if(!fs.existsSync('session')) {
                await fs.promises.mkdir('session');
            }
        });
}

function initActions(botObj, logger) {
    botObj.action('start', async (ctx) => {
        logger.info(`Received /start action from userid ${ctx.from.id}`);

        const keyboardMarkupExtra = Markup.inlineKeyboard([
                [Markup.callbackButton(`🔍 ${ctx.i18n.t('general.buttons.search')}`, 'search')],
                [
                    Markup.callbackButton(`⚙ ${ctx.i18n.t('general.buttons.settings')}`, 'settings'),
                    Markup.callbackButton(`❓ ${ctx.i18n.t('general.buttons.help')}`, 'help'),
                    Markup.callbackButton(`ℹ ${ctx.i18n.t('general.buttons.about')}`, 'about')
                ]
            ])
            .oneTime()
            .extra();

        await ctx.answerCbQuery();
        await ctx.editMessageText(ctx.i18n.t('general.welcome'), keyboardMarkupExtra);
    })
    .action('help', async (ctx) => {
        logger.info(`Received /help action from userid ${ctx.from.userid}`);

        const extras = Extra
            .markdown()
            .markup((m) => {
                return m.inlineKeyboard([
                    m.callbackButton(`◀ ${ctx.i18n.t('general.buttons.back')}`, 'start')
                ])
                .oneTime();
            });

        await ctx.answerCbQuery();
        await ctx.editMessageText(getHelpText(ctx), extras);
    })
    .action('about', async (ctx) => {
        logger.info(`Received /about action from userid ${ctx.from.userid}`);

        const extras = Extra
            .markdown()
            .markup((m) => {
                return m.inlineKeyboard([
                    m.callbackButton(`◀ ${ctx.i18n.t('general.buttons.back')}`, 'start')
                ])
                .oneTime();
            });
        
        await ctx.answerCbQuery();
        await ctx.editMessageText(getAboutText(ctx), extras);
    })
    .action('settings', async(ctx) => {
        logger.info(`Received /search action from userid ${ctx.from.userid}`);

        const keyboardMarkupExtra = Markup.inlineKeyboard([
            [Markup.callbackButton(`🔃 ${ctx.i18n.t('general.buttons.changeLang')}`, 'change_lang')],
            [Markup.callbackButton(`◀ ${ctx.i18n.t('general.buttons.back')}`, 'start')]
        ])
        .oneTime()
        .extra();

        await ctx.answerCbQuery();
        await ctx.editMessageText(ctx.i18n.t('setting.commandDesc'), keyboardMarkupExtra);
    })
    .action('change_lang', async(ctx) => {
        logger.info(`Received /switchLang action from userid ${ctx.from.userid}`);

        const keyboardMarkupExtra = Markup.inlineKeyboard([
            [
                Markup.callbackButton(`🇬🇧🇺🇸 ${ctx.i18n.t('general.lang.en')}`, 'change_lang_en'),
                Markup.callbackButton(`💚 ${ctx.i18n.t('general.lang.eo')}`, 'change_lang_eo')
            ],
            [Markup.callbackButton(`◀ ${ctx.i18n.t('general.buttons.back')}`, 'settings'), Markup.callbackButton(`🏠 ${ctx.i18n.t('general.buttons.home')}`, 'start')]
        ])
        .oneTime()
        .extra();

        await ctx.answerCbQuery();
        await ctx.editMessageText(ctx.i18n.t('setting.switchLang.commandDesc'), keyboardMarkupExtra);
    })
    .action(/^change_lang_([a-z]{2})$/, async(ctx) => {
        logger.info(`Received /switchLang [lang] action from userid ${ctx.from.userid}`);

        const newLocale = ctx.match[1];

        const returnObj = await Common.switchLang(newLocale);
        const localeObj = new Polyglot({
            phrases: returnObj.localeObj,
            locale: newLocale
        });
        ctx.i18n = localeObj;

        await ctx.telegram.setMyCommands([
            {command: 'start', description: ctx.i18n.t('help.startTg')},
            {command: 'help', description: ctx.i18n.t('help.showHelp')},
            {command: 'about', description: ctx.i18n.t('help.showAbout')},
            {command: 'search', description: ctx.i18n.t('help.search')},
        ]);

        const keyboardMarkupExtra = Markup.inlineKeyboard([
            [Markup.callbackButton(`◀ ${ctx.i18n.t('general.buttons.back')}`, 'settings')]
        ])
        .oneTime()
        .extra();

        await ctx.answerCbQuery();
        await ctx.editMessageText(ctx.i18n.t('setting.switchLang.nowLang'), keyboardMarkupExtra);
    });

    // Dictionary search actions
    botObj.action('search', async(ctx) => {
        logger.info(`Received /search action from userid ${ctx.from.userid}`);

        const keyboardMarkupExtra = Markup.inlineKeyboard([
            [
                Markup.callbackButton(ctx.i18n.t('general.lang.en'), 'search_en'),
                Markup.callbackButton(ctx.i18n.t('general.lang.eo'), 'search_eo')
            ],
            [Markup.callbackButton(`◀ ${ctx.i18n.t('general.buttons.back')}`, 'start')]
        ])
        .oneTime()
        .extra();

        ctx.session.isSearching = false;

        await ctx.answerCbQuery();
        await ctx.editMessageText(ctx.i18n.t('search.searchLangReply'), keyboardMarkupExtra);
    })
    .action('search_renew', async(ctx) => {
        logger.info(`Received /search action -> renew search from userid ${ctx.from.userid}`);

        const keyboardMarkupExtra = Markup.inlineKeyboard([
            [
                Markup.callbackButton(ctx.i18n.t('general.lang.en'), 'search_en'),
                Markup.callbackButton(ctx.i18n.t('general.lang.eo'), 'search_eo')
            ],
            [Markup.callbackButton(`◀ ${ctx.i18n.t('general.buttons.back')}`, 'start')]
        ])
        .oneTime()
        .extra();

        ctx.session.isSearching = false;

        await ctx.answerCbQuery();
        await ctx.reply(ctx.i18n.t('search.searchLangReply'), keyboardMarkupExtra);
    })
    .action(/^search_([a-z]{2})$/, async (ctx) => {
        logger.info(`Received /search [lang] action from userid ${ctx.from.id}`);

        const keyboardMarkupExtra = Markup.inlineKeyboard([
            [Markup.callbackButton(`❌ ${ctx.i18n.t('general.buttons.cancel')}`, 'search')]
        ])
        .oneTime()
        .extra();

        const searchTermLocale = ctx.match[1];

        ctx.session.isSearching = true;
        ctx.session.searchTermLocale = searchTermLocale;

        await ctx.answerCbQuery();
        await ctx.editMessageText(ctx.i18n.t('search.searchSendReply', {locale: searchTermLocale}), keyboardMarkupExtra);
    });
}

function getHelpText(ctx) {
    const replyText = `
        *${ctx.i18n.t('help.title')}*
        */start*: ${ctx.i18n.t('help.startTg')}
        */help*: ${ctx.i18n.t('help.showHelp')}
        */about*: ${ctx.i18n.t('help.showAbout')}
        */search*: ${ctx.i18n.t('help.search')}
    `.split('\n')
    .map((d) => { return d.trim() })
    .join('\n');

    return replyText;
}

function getAboutText(ctx) {
    const replyText = `
        *${ctx.i18n.t('about.intro.header')}*
        ${ctx.i18n.t('about.intro.desc')}

        *${ctx.i18n.t('about.support.header')}*
        ${ctx.i18n.t('about.support.desc')}
    `.split('\n')
    .map((d) => { return d.trim() })
    .join('\n');

    return replyText;
}

main();
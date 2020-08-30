import fs from 'fs';
import readline from 'readline';
import path from 'path';

import dotenv from 'dotenv';
import {loggers} from 'winston';
import Polyglot from 'node-polyglot';
import Discord from 'discord.js';
import {Logger} from '../logger';

import { Common } from '../common';

async function main() {
    dotenv.config();

    const discordClient = new Discord.Client();
    const loggerObj = Logger.createNewLogger('discord');
    const logger = loggerObj.loggerObj;

    process.env.LOCALE_CODE = "eo";
    process.env.LOCALE_JSON = "{}";
    process.env.SHARED_LOGGER_ID = loggerObj.id;

    discordClient.on('ready', async () => {
        let returnObj = await Common.switchLang('eo');

        process.env.LOCALE_CODE = 'eo';
        process.env.LOCALE_JSON = JSON.stringify(returnObj.localeObj);

        logger.info(`Logged-in as ${discordClient.user.tag}!`);
    })
    .on('rateLimit', (rateLimitInfo) => {
        logger.warn(`We have reached a rate limit! Limit: ${rateLimitInfo.limit}`);
    })
    .on('message', async (discordMsgObj) => {
        const localeObj = new Polyglot({
            phrases: JSON.parse(process.env.LOCALE_JSON),
        });

        try {
            await parseCommand(discordMsgObj);
        }
        catch(error) {
            logger.error(`Error processing command: ${error}`);

            discordMsgObj.reply(localeObj.t('general.noCommand'));
        }
    });

    logger.info('Connecting to Discord client...');
    
    try {
       await discordClient.login(process.env.DISCORD_CLIENT_TOKEN);
    }
    catch(err) {
        logger.error(`Error in logging-in: ${err}`);
    };
}

async function parseCommand(discordMsgObj) {
    const logger = loggers.get(process.env.SHARED_LOGGER_ID);
    
    let searchLang = '';
    let searchTerm = '';
    const commandTokens = discordMsgObj.content.split(' ').map((v) => v.toLowerCase());

    const localeObj = new Polyglot({
        phrases: JSON.parse(process.env.LOCALE_JSON),
    });

    if(commandTokens.length <= 1) {
        // Ignore
        return;
    }

    if(commandTokens[0] != ';;vortaro') {
        return;
    }

    logger.info(`Received valid command from "${discordMsgObj.author.username}"`);

    switch(commandTokens[1]) {
        case 'en': {
            searchTerm = commandTokens.slice(2).join(' ');
            searchLang = 'en';

            logger.info(`EO search: ${searchTerm}`);
            await discordMsgObj.reply(localeObj.t('search.searchEn', {searchTerm: searchTerm}));

            break;
        }
        case 'eo': {
            searchTerm = Common.asciiToHats(commandTokens.slice(2).join(' '));
            searchLang = 'eo';

            logger.info(`EN search: ${searchTerm}`);
            await discordMsgObj.reply(localeObj.t('search.searchEo', {searchTerm: searchTerm}));

            break;
        }
        case 'help': {
            const embedMsg = new Discord.MessageEmbed()
                .setColor('#20230')
                .setTitle(localeObj.t('help.title'))
                .addFields(
                    {name: localeObj.t('help.showHelp'), value: '`;;vortaro help`'},
                    {name: localeObj.t('help.showAbout'), value: '`;;vortaro about`'},
                    {name: localeObj.t('help.showLang'), value: '`;;vortaro lang`'},
                    {name: localeObj.t('help.switchLang'), value: '`;;vortaro lang <iso639-1>`'},
                    {name: localeObj.t('help.eoEn'), value: '`;;vortaro eo <term>`'},
                    {name: localeObj.t('help.enEo'), value: '`;;vortaro en <term>`'},
                );

            logger.info('Show help');
            await discordMsgObj.reply(localeObj.t('help.replyMsg'));

            const dmChannel = await discordMsgObj.author.createDM();
            await dmChannel.send('', embedMsg);

            break;
        }
        case 'about': {
            const embedMsg = new Discord.MessageEmbed()
                .setColor('#20230')
                .setTitle(localeObj.t('general.botName'))
                .addFields(
                    {name: localeObj.t('about.intro.header'), value: localeObj.t('about.intro.desc')},
                    {name: localeObj.t('about.help.header'), value: localeObj.t('about.help.desc_discord')},
                    {name: localeObj.t('about.support.header'), value: localeObj.t('about.support.desc')},
                );

            logger.info('Show about');
            await discordMsgObj.reply('', embedMsg);

            break;
        }
        case 'lang': {
            const langCode = commandTokens.slice(2).join(' ').toLowerCase();

            if(commandTokens.length == 2) {
                await discordMsgObj.reply(localeObj.t('setting.switchLang.nowLang'));
            }
            else {
                const resultObj = await Common.switchLang(langCode);

                process.env.LOCALE_CODE = langCode;
                process.env.LOCALE_JSON = JSON.stringify(resultObj.localeObj);

                await discordMsgObj.reply(resultObj.replyMsg);
            }

            break;
        }
        default: {
            await discordMsgObj.reply(localeObj.t('general.notRecognized'));
        }
    }

    // Dictionary search
    if(['en', 'eo'].indexOf(searchLang) >= 0 && searchTerm.length > 0) {
        try {
            const defsArr = await Common.findFromDictionary(searchTerm, searchLang);
    
            if(defsArr.length <= 0) {
                //discordMsgObj.delete();
                await discordMsgObj.reply(localeObj.t('search.notFound', {searchTerm: searchTerm}));
            }
            else {
                let nextMsg = localeObj.t('search.found', {smart_count: defsArr.length, searchTerm: searchTerm});
    
                defsArr.forEach((def, i) => {
                    nextMsg += `\n**[${i + 1}]: ${def[0]}** - ${def[1]}`;
                });
    
                await discordMsgObj.reply(nextMsg);
            }
        }
        catch(error) {
            logger.error(`Error while searching term ${searchTerm}: ${error}`);
    
            //discordMsgObj.delete();
            await discordMsgObj.reply(localeObj.t('search.noSearch'));
        }
    }
}

async function switchLang(toLangCode) {
    const logger = loggers.get(process.env.SHARED_LOGGER_ID);
    const localeObj = new Polyglot({
        phrases: JSON.parse(process.env.LOCALE_JSON),
    });

    let returnObj = {};

    if(['en', 'eo'].indexOf(toLangCode) < 0) {
        logger.info(`Unrecognized language ${toLangCode}`);

        returnObj.replyMsg = localeObj.t('setting.switchLang.noLang');
        returnObj.localeObj = {};
    }
    else {
        logger.info(`Switching language to ${toLangCode}`);

        const localeFile = await fs.promises.readFile(path.join(__dirname, `/i18n/${toLangCode}.json`), 'utf-8');
        localeObj.extend(JSON.parse(localeFile));
        process.env.LOCALE_CODE = toLangCode;
        process.env.LOCALE_JSON = localeFile;

        returnObj.replyMsg = localeObj.t('setting.switchLang.nowLang');
        returnObj.localeObj = JSON.parse(localeFile);
    }

    return returnObj;
}

main();
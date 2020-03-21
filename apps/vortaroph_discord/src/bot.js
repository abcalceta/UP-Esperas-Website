import fs from 'fs';
import readline from 'readline';
import path from 'path';

import dotenv from 'dotenv';
import {loggers} from 'winston';
import Polyglot from 'node-polyglot';
import Discord from 'discord.js';
import {Logger} from './logger';

async function main() {
    dotenv.config();

    const discordClient = new Discord.Client();
    const loggerObj = Logger.createNewLogger();
    const logger = loggerObj.loggerObj;

    process.env.LOCALE_CODE = "eo";
    process.env.LOCALE_JSON = "{}";
    process.env.SHARED_LOGGER_ID = loggerObj.id;

    discordClient.on('ready', () => {
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
       await discordClient.login(process.env.CLIENT_TOKEN);
       await switchLang('eo');
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
            searchTerm = asciiToHats(commandTokens.slice(2).join(' '));
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
                    {name: localeObj.t('about.help.header'), value: localeObj.t('about.help.desc')},
                    {name: localeObj.t('about.support.header'), value: localeObj.t('about.support.desc')},
                );

            logger.info('Show about');
            await discordMsgObj.reply('', embedMsg);

            break;
        }
        case 'lang': {
            const langCode = commandTokens.slice(2).join(' ').toLowerCase();

            if(commandTokens.length == 2) {
                await discordMsgObj.reply(localeObj.t('switchLang.nowLang'));
            }
            else {
                const resultObj = await switchLang(langCode);

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
            const defsArr = await findFromDictionary(searchTerm, searchLang);
    
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

        returnObj.replyMsg = localeObj.t('switchLang.noLang');
        returnObj.localeObj = {};
    }
    else {
        logger.info(`Switching language to ${toLangCode}`);

        const localeFile = await fs.promises.readFile(path.join(__dirname, `/i18n/${toLangCode}.json`), 'utf-8');
        localeObj.extend(JSON.parse(localeFile));
        process.env.LOCALE_CODE = toLangCode;
        process.env.LOCALE_JSON = localeFile;

        returnObj.replyMsg = localeObj.t('switchLang.nowLang');
        returnObj.localeObj = JSON.parse(localeFile);
    }

    return returnObj;
}

async function findFromDictionary(term, lang='eo') {
    const logger = loggers.get(process.env.SHARED_LOGGER_ID);

    return new Promise((resolve, reject) => {
        const defsArr = [];

        // Transform term to its root
        // Lowercased and spaces trimmed
        let searchTerm = term;

        if(lang == 'eo') {
            searchTerm = wordToRoot(term);
            logger.info(`Esperanto term converted to root word (${searchTerm})!`);
        }

        const fileStream = fs.createReadStream(path.join(__dirname, '/espdic.txt'));
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity,
        });

        rl.on('line', (eachLine) => {
            const lineTokens = eachLine.split(':').map((v) => v.trim());

            if(lineTokens[0][0] == '#' || eachLine.trim().length <= 0) {
                // Ignore comments and blanks
                return;
            }

            if(lang == 'eo') {
                const lineTerm = wordToRoot(lineTokens[0].toLowerCase());

                if(lineTerm.indexOf(searchTerm) == 0) {
                    let rank = Math.abs(lineTerm.length - term.length);
                    
                    if(lineTerm == searchTerm) {
                        rank = -1;
                    }

                    lineTokens.unshift(rank);
                    defsArr.push(lineTokens);
                }
            }
            else {
                if(lineTokens.length < 2) {
                    // Skip line if it cannot be split
                    return;
                }

                const lineTerms = lineTokens[1].toLowerCase().split(',').map((v) => v.trim());

                for(const eachLineToken of lineTerms) {
                    if(eachLineToken.indexOf(searchTerm) >= 0) {
                        lineTokens.unshift(Math.abs(eachLineToken.length - term.length));
                        defsArr.push(lineTokens);

                        break;
                    }
                }
            }
        })
        .on('close', () => {
            // Sort results by length closest to original search term
            // Limit to 10 terms only
            const newDefsArr = defsArr.sort((a, b) => {
                return a[0] - b[0];
            }).map((v) => {
                return v.slice(1);
            });

            resolve(newDefsArr.slice(0, 10));
        })
    });
}

function wordToRoot(term) {
    const oneEndingCases = ['a', 'e', 'i', 'o', 'u'];
    const twoEndingCases = ['on', 'an', 'aj', 'oj', 'as', 'is', 'os', 'us'];
    const threeEndingCases = ['ojn', 'ajn', 'ita', 'ata', 'ota'];
    const fourEndingCases = ['inta', 'anta', 'onta'];
    
    let rootWord = term.toLowerCase().trim();
    let ending2 = rootWord.slice(-2);
    let ending3 = rootWord.slice(-3);
    let ending4 = rootWord.slice(-4);

    if(oneEndingCases.indexOf(rootWord.slice(-1)) >= 0 && rootWord.length > 1) {
        rootWord = rootWord.slice(0, -1);
    }
    if(twoEndingCases.indexOf(ending2) >= 0 && rootWord.length > 2) {
        rootWord = rootWord.slice(0, -2);
    }
    else if(threeEndingCases.indexOf(ending3) >= 0 && rootWord.length > 3) {
        rootWord = rootWord.slice(0, -3);
    }
    else if(fourEndingCases.indexOf(ending4) >= 0 && rootWord.length > 4) {
        rootWord = rootWord.slice(0, -4);
    }

    return rootWord;
}

function asciiToHats(term) {
    let newTerm = term.toLowerCase().trim();

    newTerm = [...newTerm].reduce((acc, cval) => {
        let newVal = acc;
      
        if(cval == 'x') {
           switch(acc.slice(-1)) {
                case 'c': {
                    newVal = `${acc.slice(0, -1)}ĉ`;
                    break;
                }
                case 'g': {
                    newVal = `${acc.slice(0, -1)}ĝ`;
                    break;
                }
                case 'h': {
                    newVal = `${acc.slice(0, -1)}ĥ`;
                    break;
                }
                case 'j': {
                    newVal = `${acc.slice(0, -1)}ĵ`;
                    break;
                }
                case 's': {
                    newVal = `${acc.slice(0, -1)}ŝ`;
                    break;
                }
                case 'u': {
                    newVal = `${acc.slice(0, -1)}ŭ`;
                    break;
                }
                default: {
                    newVal = acc + cval;
                }
            }
        }
        else {
            newVal = acc + cval;
        }
      
        return newVal;
    });

    return newTerm;
}

main();
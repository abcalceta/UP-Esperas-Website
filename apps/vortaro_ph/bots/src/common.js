import fs from 'fs';
import readline from 'readline';
import path from 'path';

import {loggers} from 'winston';
import Polyglot from 'node-polyglot';

async function switchLang(toLangCode, oldLocaleObj = {}) {
    const logger = loggers.get(process.env.SHARED_LOGGER_ID);
    const localeObj = new Polyglot({
        phrases: oldLocaleObj
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
        
        localeObj.locale(toLangCode);
        returnObj.replyMsg = localeObj.t('setting.switchLang.nowLang');
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
        let searchTerm = term.toUpperCase();

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
                const lineTermRoot = wordToRoot(lineTokens[0]).toUpperCase();
                const termRoot = wordToRoot(searchTerm);

                if(lineTermRoot.indexOf(termRoot) == 0) {
                    const posDiff = strFirstDiffPos(lineTokens[0].toUpperCase(), searchTerm);
                    let rank = Math.max(lineTokens[0].length, searchTerm.length) - posDiff;

                    if(posDiff < 0) {
                        rank = posDiff;
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

                const lineTerms = lineTokens[1].toUpperCase().split(',').map((v) => v.trim());

                for(const eachLineToken of lineTerms) {
                    if(eachLineToken.indexOf(searchTerm) >= 0) {
                        const posDiff = strFirstDiffPos(eachLineToken, searchTerm);
                        let rank = Math.max(eachLineToken.length, searchTerm.length) - posDiff;

                        if(posDiff < 0) {
                            rank = posDiff;
                        }

                        lineTokens.unshift(rank);
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
    const oneEndingCases = ['A', 'E', 'I', 'O', 'U'];
    const twoEndingCases = ['ON', 'AN', 'AJ', 'OJ', 'AS', 'IS', 'OS', 'US'];
    const threeEndingCases = ['OJN', 'AJN', 'ITA', 'ATA', 'OTA'];
    const fourEndingCases = ['INTA', 'ANTA', 'ONTA'];
    
    let rootWord = term.toUpperCase().trim();
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
    let newTerm = term;

    newTerm = [...newTerm].reduce((acc, cval) => {
        let newVal = acc;
      
        if(cval == 'x' || cval == 'X') {
           switch(acc.slice(-1)) {
                case 'c': {
                    newVal = `${acc.slice(0, -1)}ĉ`;
                    break;
                }
                case 'C': {
                    newVal = `${acc.slice(0, -1)}Ĉ`;
                    break;
                }
                case 'g': {
                    newVal = `${acc.slice(0, -1)}ĝ`;
                    break;
                }
                case 'G': {
                    newVal = `${acc.slice(0, -1)}Ĝ`;
                    break;
                }
                case 'h': {
                    newVal = `${acc.slice(0, -1)}ĥ`;
                    break;
                }
                case 'H': {
                    newVal = `${acc.slice(0, -1)}Ĥ`;
                    break;
                }
                case 'j': {
                    newVal = `${acc.slice(0, -1)}ĵ`;
                    break;
                }
                case 'J': {
                    newVal = `${acc.slice(0, -1)}Ĵ`;
                    break;
                }
                case 's': {
                    newVal = `${acc.slice(0, -1)}ŝ`;
                    break;
                }
                case 'S': {
                    newVal = `${acc.slice(0, -1)}Ŝ`;
                    break;
                }
                case 'u': {
                    newVal = `${acc.slice(0, -1)}ŭ`;
                    break;
                }
                case 'U': {
                    newVal = `${acc.slice(0, -1)}Ŭ`;
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

function strFirstDiffPos(a, b) {
    let i = 0;
    
    if (a === b) return -1;
    while (a[i] === b[i]) i++;
    return i;
}

export const Common = {
    switchLang,
    findFromDictionary,
    wordToRoot,
    asciiToHats
};
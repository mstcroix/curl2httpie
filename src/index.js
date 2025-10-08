#!/usr/bin/env node

import { program } from 'commander';
import clipboardy from 'clipboardy';
import yargsParser from 'yargs-parser';

function parseQuotedString(str) {
    return str.replace(/^['"](.*)['"]$/, '$1');
}

function parseCurlCommand(curlCommand) {
    // Split the command by spaces and newlines while preserving quoted strings
    const parts = curlCommand
        .replace(/^\s*curl\s+/, '') // Remove 'curl' command
        .match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
    
    const result = {
        method: 'GET',
        url: '',
        headers: {},
        data: null
    };

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        // Handle URL (first non-flag argument)
        if (!part.startsWith('-') && !result.url) {
            result.url = parseQuotedString(part);
            continue;
        }

        switch (part) {
            case '-X':
            case '--request':
                result.method = parts[++i].toUpperCase();
                break;

            case '-H':
            case '--header':
                const header = parseQuotedString(parts[++i]);
                const [name, ...valueParts] = header.split(/:\s*/);
                const value = valueParts.join(':').trim();
                if (name && value) {
                    result.headers[name] = value;
                }
                break;

            case '-d':
            case '--data':
            case '--data-binary':
                result.data = parseQuotedString(parts[++i]);
                result.method = result.method === 'GET' ? 'POST' : result.method;
                // Try to parse as JSON
                try {
                    result.data = JSON.parse(result.data);
                    result.headers['Content-Type'] = 'application/json';
                } catch (e) {
                    // If not JSON, keep as string
                }
                break;
        }
    }

    return result;
}

function convertToHttpie(parsedCurl) {
    const parts = ['http'];

    // Add method if not GET
    if (parsedCurl.method !== 'GET') {
        parts.push(parsedCurl.method);
    }

    // Add URL
    parts.push(parsedCurl.url);

    // Add headers
    Object.entries(parsedCurl.headers).forEach(([name, value]) => {
        // Escape any quotes in the value
        const escapedValue = value.replace(/"/g, '\\"');
        parts.push(`${name}:"${escapedValue}"`);
    });

    // Add data
    if (parsedCurl.data) {
        if (typeof parsedCurl.data === 'object') {
            // Handle JSON data
            Object.entries(parsedCurl.data).forEach(([key, value]) => {
                parts.push(`${key}=${JSON.stringify(value)}`);
            });
        } else {
            // Handle raw data
            parts.push(`@data='${parsedCurl.data}'`);
        }
    }

    return parts.join(' ');
}

async function main() {
    program
        .name('curl2httpie')
        .description('Convert curl commands to HTTPie syntax')
        .action(async () => {
            try {
                // Read from clipboard
                const curlCommand = await clipboardy.read();
                
                if (!curlCommand.trim().toLowerCase().startsWith('curl ')) {
                    console.error('Error: Clipboard content does not appear to be a curl command');
                    process.exit(1);
                }
                
                // Parse and convert the command
                const parsed = parseCurlCommand(curlCommand);
                const httpieCommand = convertToHttpie(parsed);
                
                // Write back to clipboard
                await clipboardy.write(httpieCommand);
                
                console.log('Successfully converted curl command to HTTPie syntax!');
                console.log('\nOriginal curl command:');
                console.log(curlCommand);
                console.log('\nConverted HTTPie command:');
                console.log(httpieCommand);
            } catch (error) {
                console.error('Error:', error.message);
                process.exit(1);
            }
        });

    program.parse();
}

main();
/**
 * Copyright (c) 2022-2026 NOISIF. All Rights Reserved.
 *
 * NOTICE: This source code is publicly available for reference
 * and educational purposes only. It is NOT open-source software.
 *
 * You are granted permission to view this code. However, you are strictly
 * PROHIBITED from copying, modifying, or merging this code into other software,
 * distributing, publishing, or sublicensing this code, using this code for
 * commercial purposes or in production environments.
 *
 * THIS SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF
 * MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.
 *
 * Please refer to the LICENSE file in the root directory for full restrictions.
 */
import fs from 'fs';
import path from 'path';
import { CommentStrategy, ConfigFile, ManagerConfig } from './types';

export class CopyrightManager {
  private licensesMap: Map<string, string[]> = new Map();
  private strategies: Record<string, CommentStrategy> = {};
  private ignoreDirs: string[] = [];
  private supportedExtensions: string[] = [];
  private oldHeaderRegex!: RegExp;
  private currentYear: string;

  constructor(private config: ManagerConfig) {
    this.currentYear = new Date().getFullYear().toString();
  }

  public run(): void {
    this.loadConfig();
    this.loadLicenses();
    this.buildRegex();
    const files = this.getFiles(this.config.rootDir);
    let updated = 0;
    for (let i = 0; i < files.length; i++) {
      if (this.processFile(files[i])) {
        updated++;
      }
    }
    console.log(`Finished processing files, modified ${updated} files`);
  }

  private loadConfig(): void {
    const rawJson = fs.readFileSync(this.config.configFilePath, 'utf8');
    const parsed: ConfigFile = JSON.parse(rawJson);
    this.strategies = parsed.strategies;
    this.ignoreDirs = parsed.ignoreDirs;
    this.supportedExtensions = Object.keys(this.strategies);
  }

  private loadLicenses(): void {
    const uniqueLicenseFiles = new Set<string>();
    for (const ext of this.supportedExtensions) {
      const strategy = this.strategies[ext];
      if (strategy.licenseFile) {
        uniqueLicenseFiles.add(strategy.licenseFile);
      } else {
        console.warn(`Strategy for ${ext} is missing 'licenseFile', it will be skipped`);
      }
    }
    for (const filename of uniqueLicenseFiles) {
      const fullPath = path.resolve(this.config.licenseFilesDir, `${filename}.txt`);
      const rawText = fs.readFileSync(fullPath, 'utf8');
      const lines = rawText.replace(/\r\n/g, '\n').trimEnd().split('\n');
      this.licensesMap.set(filename, lines);
    }
  }

  private buildRegex(): void {
    const startTags = [
      ...new Set(Object.values(this.strategies).map((s) => this.escapeRegex(s.start.trim())))
    ].join('|');
    const endTags = [
      ...new Set(Object.values(this.strategies).map((s) => this.escapeRegex(s.end.trim())))
    ].join('|');
    const firstLines = new Set<string>();
    for (const lines of this.licensesMap.values()) {
      if (lines.length > 0) {
        firstLines.add(lines[0]);
      }
    }
    const licenseIdentifiers = Array.from(firstLines)
      .map((line) => this.escapeRegex(line).replace('\\$YEAR', '\\d{4}'))
      .join('|');
    this.oldHeaderRegex = new RegExp(
      `^(?:${startTags})[\\s\\S]*?(?:${licenseIdentifiers})[\\s\\S]*?(?:${endTags})\\s*`,
      'i'
    );
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private generateHeader(ext: string): string {
    const strategy = this.strategies[ext];
    if (!strategy) {
      return '';
    }
    const licenseLines = this.licensesMap.get(strategy.licenseFile);
    if (!licenseLines) {
      return '';
    }
    if (licenseLines.length === 1) {
      const parsedLine = licenseLines[0].replace(/\$YEAR/g, this.currentYear).trim();
      const startTag = strategy.start.trim();
      const endTag = strategy.end.trim();
      return `${startTag} ${parsedLine} ${endTag}\n`;
    }
    const middle = licenseLines
      .map((line) => {
        const parsedLine = line.replace(/\$YEAR/g, this.currentYear);
        if (parsedLine.trim() === '') {
          return strategy.linePrefix.trimEnd();
        }
        return `${strategy.linePrefix}${parsedLine}`;
      })
      .join('\n');
    return `${strategy.start}\n${middle}\n${strategy.end}`;
  }

  private getFiles(startDir: string): string[] {
    const results: string[] = [];
    const stack: string[] = [startDir];
    while (stack.length > 0) {
      const currentDir = stack.pop()!;
      let list: string[];
      try {
        list = fs.readdirSync(currentDir);
      } catch (_) {
        continue;
      }
      for (let i = 0; i < list.length; i++) {
        const file = list[i];
        const fullPath = path.join(currentDir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          if (!this.ignoreDirs.includes(file)) {
            stack.push(fullPath);
          }
        } else {
          if (this.supportedExtensions.includes(path.extname(fullPath))) {
            results.push(fullPath);
          }
        }
      }
    }
    return results;
  }

  private processFile(filePath: string): boolean {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.trim() === '') {
      return false;
    }
    const ext = path.extname(filePath);
    const expectedHeader = this.generateHeader(ext);
    if (!expectedHeader || content.startsWith(expectedHeader)) {
      return false;
    }
    let newContent = content;
    let action = 'Added';
    if (this.oldHeaderRegex.test(content)) {
      newContent = content.replace(this.oldHeaderRegex, '');
      action = 'Updated';
    }
    fs.writeFileSync(filePath, expectedHeader + newContent, 'utf8');
    console.log(`${action} header in ${path.relative(this.config.rootDir, filePath)}`);
    return true;
  }
}

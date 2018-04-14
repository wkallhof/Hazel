import { Component, Inject } from '@nestjs/common';
import Document from "../document/document";
import { ServiceResult, ServiceDataResult } from '../service-result';
import * as _ from "lodash";
import * as path from "path";
import * as fs from "fs-extra";
import * as _s from "underscore.string";
import DI from '../../di';
import { IDocumentParserService } from '../document/document-parser.service';


export interface IStorageService{
    readDocumentAsync(slug : string): Promise<ServiceDataResult<Document>>;
    storeDocumentAsync(document : Document): Promise<ServiceResult>;
    deleteDocumentAsync(document : Document): Promise<ServiceResult>;
    getAllDocumentsAsync(): Promise<ServiceDataResult<Array<Document>>>;
    storeObjectAsync<T>(key: string,data : T): Promise<ServiceResult>;
    readObjectAsync<T>(key: string): Promise<ServiceDataResult<T>>;
}

@Component()
export class MarkdownDiskStorageService implements IStorageService {

    /*--------------------------------------------*
     *          SERVICE IMPLEMENTATION            *
     *--------------------------------------------*/

    //TODO: pull from settings
    private readonly _contentDir: string = path.join(__dirname, "content");
    private readonly _dataDir: string = path.join(__dirname, "data");
    private readonly _parser: IDocumentParserService;
    
    constructor(@Inject(DI.IDocumentParserService) documentParserService: IDocumentParserService){
        this._parser = documentParserService;
    }

    public async initializeAsync(): Promise<MarkdownDiskStorageService> {
        await this.createDirectoriesAsync();
        return this;
    }
    
    public async readDocumentAsync(slug: string): Promise<ServiceDataResult<Document>> {
        if (slug == null)
            return new ServiceDataResult<Document>({ success: false, message: "Slug not provided" });
        
        const filePath = path.join(this._contentDir, slug + ".md");

        // try to read the file on disk
        try {
            let fileContent = await fs.readFile(filePath, "utf8");
            let result = await this._parser.getDocumentFromFileContentAsync(fileContent);
            if (!result.success)
                return new ServiceDataResult<Document>(result);

            let document = result.data;
            document.slug = slug;
            if (!document.title) {
                document.title = this.slugToTitle(slug);
            }

            return new ServiceDataResult({success: true, data: document});
        } catch (e) {
            return new ServiceDataResult({success: false, message: `Tried to open file: ${slug} as markdown. `});
        }
    }
    public async storeDocumentAsync(document: any): Promise<ServiceResult> {
        let filePath = path.join(this._contentDir, document.slug + ".md");
        let result = await this._parser.convertDocumentToFileContentAsync(document);
        if (!result.success)
            return new ServiceResult({ success: false, message: result.message });    

        try {
            await fs.writeFile(filePath, result.data, "utf8");
            return new ServiceResult({ success: true });
        } catch (e) {
            return new ServiceResult({ success: false, message: "Error writing content to file" + document.slug });
        }
    }

    public async deleteDocumentAsync(document: any): Promise<ServiceResult> {
        let filePath = path.join(this._contentDir, document.slug + ".md");

        try {
            await fs.unlink(filePath);
            return new ServiceResult({ success: true });
        } catch (e) {
            return new ServiceResult({ success: false, message: "Error deleting file" + document.slug});
        }
    }

    public async getAllDocumentsAsync(): Promise<ServiceDataResult<Document[]>> {
        try {
            const fileNames = await fs.readdir(this._contentDir);
            const validFiles = _.filter(fileNames, (fileName) => {
                return fileName.length > 3 && fileName.endsWith(".md");
            });

            const readPromises = _.map(validFiles, (fileName) => {
                return this.readDocumentAsync(fileName.replace(".md", ""));
            });
            
            const documents = _.map(await Promise.all(readPromises), (result) => {
                if (!result.success)
                    throw ("Error reading file");
                
                return result.data;
            });

            return new ServiceDataResult({ success: true, data: documents });
        
        } catch (e) {
            return new ServiceDataResult({ success: false, message: "Error reading all files" });
        }
    }

    public async storeObjectAsync<T>(key: string, data: any): Promise<ServiceResult> {
        let filePath = path.join(this._dataDir, key);

        try {
            await fs.writeFile(filePath, JSON.stringify(data), "utf8");
            return new ServiceResult({ success: true });
        } catch (e) {
            return new ServiceResult({ success: false, message: "Error writing object to file" + key });
        }
    }

    public async readObjectAsync(key: string): Promise<ServiceDataResult<any>> {
        let filePath = path.join(this._dataDir, key);

        // try to read the file on disk
        try {
            let fileContent = await fs.readFile(filePath, "utf8");
            return new ServiceDataResult({ success: true, data: JSON.parse(fileContent) });
        } catch (e) {
            return new ServiceDataResult({ success: false, message:`Tried to open file: ${key} as object. `});
        }
    }

    /*--------------------------------------------*
     *            PRIVATE HELPERS                 *
     *--------------------------------------------*/

    /**
     * Handles converting a title to a slug
     * for the URL
     */
    private titleToSlug(title) {
        return title.toString().toLowerCase()
            .replace(/\s+/g, "-")           // Replace spaces with -
            .replace(/[^\w\-]+/g, "")       // Remove all non-word chars
            .replace(/\-\-+/g, "-")         // Replace multiple - with single -
            .replace(/^-+/, "")             // Trim - from start of text
            .replace(/-+$/, "");            // Trim - from end of text
    }

    private slugToTitle(slug) {
        return _s.titleize(_s.humanize(slug.trim()));
    }
    
    private async createDirectoriesAsync() {
        try {
            await Promise.all([
                fs.ensureDir(this._contentDir),
                fs.ensureDir(this._dataDir)
            ]);
        } catch (e) { /* Do nothing */ }
    }

    /**
     * Helper method that allows for easy returning a service result
     * 
     * @private
     * @param {Partial<ServiceResult>} result 
     * @returns {Promise<ServiceResult>} 
     * @memberof DocumentService
     */
    private result(result : Partial<ServiceResult>) : ServiceResult  {
        return new ServiceResult(result);
    }

    /**
     * Helper method that allows for easy returning of a service result with data
     * 
     * @private
     * @template T 
     * @param {Partial<ServiceDataResult<T>>} result 
     * @returns {Promise<ServiceDataResult<T>>} 
     * @memberof DocumentService
     */
    private resultWithData<T>(result : Partial<ServiceDataResult<T>>) : ServiceDataResult<T>  {
        return new ServiceDataResult<T>(result);
    }
}
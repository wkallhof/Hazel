import { Hazel } from '../src/hazel';
import { DocumentParserService } from '../src/services/document/document-parser.service';
import { MarkdownDiskStorageService } from '../src/services/storage/storage.service';

async function server() {

    var documentParserService = new DocumentParserService()
    var storageService = new MarkdownDiskStorageService(documentParserService);
    await storageService.initializeAsync();

    const hazel = new Hazel(storageService, documentParserService);
    const app = await hazel.init();

    const port = process.env.PORT || 3000;
    const ip = process.env.IP || "127.0.0.1";

    await hazel.start(ip, port);
}

server();

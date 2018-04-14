import { Hazel } from '../src/hazel';
import { HazelConfig } from '../src/hazel.config';

async function server() {
    const hazel = new Hazel(new HazelConfig({
        appTitle : "Example app"
    }));
    const app = await hazel.init();

    const port = process.env.PORT || 3000;
    const ip = process.env.IP || "127.0.0.1";

    await hazel.start(ip, port);
}

server();

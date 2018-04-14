import { Hazel } from '../src/hazel';
import { HazelConfig, HazelServices } from '../src/hazel.config';

async function server() {

    const config = new HazelConfig({
        appTitle: "Example app"
    });

    const hazel = new Hazel(config, new HazelServices());
    const app = await hazel.init();

    const port = process.env.PORT || 3000;
    const ip = process.env.IP || "127.0.0.1";

    await hazel.start(ip, port);
}

server();

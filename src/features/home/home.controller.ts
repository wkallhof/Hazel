import { Get, Controller } from '@nestjs/common';

@Controller()
export class HomeController {
	@Get()
	root(): string {
    return 'Hello World!';
  }
}

// Config local temporária: mesma suíte, porta 3100, sem reaproveitar servidor alheio.
import base from './playwright.config.js';
export default {...base,use:{...base.use,baseURL:'http://127.0.0.1:3100'},webServer:{...base.webServer,command:'npx next dev --hostname 127.0.0.1 --port 3100',url:'http://127.0.0.1:3100',reuseExistingServer:false}};

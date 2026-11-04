// Legacy corridor coordinates stay stable for old saves, story and road events.
export function roadX(z){const t=Math.max(0,-z-240);return Math.sin(t/390)*24*Math.min(t/300,1);}
export function roadHeight(z){const t=Math.max(0,Math.min(1,(-z-12600)/5000));return Math.sin(z/180)*1.3+Math.sin(z/73)*.23+95*Math.sin(t*Math.PI)**2;}

// Same footprint as the previous solid shop. The side door is a real opening;
// boxes above/below the windows keep the visual and physical shell together.
export function buildOpenGasShop(block,m){
 block(.18,3.4,8,m.paint,-7,1.8,0,true);
 for(const z of [-4,4])block(5,3.4,.18,m.paint,-4.5,1.8,z,true);
 block(.18,1.02,8,m.paint,-2,3.02,0,true);
 block(.18,2.4,.6,m.paint,-2,1.3,-3.7,true);
 block(.18,1.4,6,m.paint,-2,.8,1,true);
 for(const z of [-1.93,.1,2.75,3.9])block(.2,1.12,.075,m.steel,-2,2.04,z);
 block(.22,.08,6,m.steel,-2,1.49,1);
 block(.12,1.01,5.8,m.glass,-1.95,2,1); // Window ends before the open door, including at eye height.
 // Door stands open against the inside side wall, clear of the entry aisle.
 block(1.24,2.15,.09,m.paint,-2.64,1.18,-3.36,true);
 block(.12,.035,.045,m.steel,-3.1,1.2,-3.29);
}

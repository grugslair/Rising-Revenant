const GAME_CONFIG: u128 = 1;
// each outpost will spawn with a default 3 reinforcements on it 
const OUTPOST_INIT_LIFE: u32 = 1;
// the max of outpost count for each revenant is 1. 
const OUTPOST_MAX_COUNT: u32 = 1;
// Outposts, can be bolstered up to 20 times in their lifetime
const OUTPOST_MAX_REINFORCEMENT: u32 = 20;
// Each wallet can mint 2 Revenants 
const REVENANT_MAX_COUNT: u32 = 2;
// each wallet has 0 reinforcements to put as they will 
// When we need to perform a demonstration, we can modify this value.
const REINFORCEMENT_INIT_COUNT: u32 = 0;

const EVENT_INIT_RADIUS: u32 = 155;
const EVENT_INCREASE_RADIUS: u32 = 5;

// The reward score offered for creating a world event
const EVENT_CREATE_SCORE: u32 = 20;
// The reward score offered for destory a outpost
const DESTORY_OUTPOST_SCORE: u32 = 5;

const MAP_WIDTH: u32 = 10240;
const MAP_HEIGHT: u32 = 5164;

const SPAWN_RANGE_X: u32 = 800; 
const SPAWN_RANGE_Y: u32 = 800;


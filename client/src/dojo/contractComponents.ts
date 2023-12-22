/* Autogenerated file. Do not edit manually. */

import { defineComponent, Type as RecsType, World } from "@latticexyz/recs";

export function defineContractComponents(world: World) {
  return {
    Game: (() => {
      return defineComponent(
        world,
        {
          game_id: RecsType.Number,
          start_block_number: RecsType.Number,
          prize: RecsType.BigInt,
          preparation_phase_interval: RecsType.Number,
          event_interval: RecsType.Number,
          erc_addr: RecsType.String,
          reward_pool_addr: RecsType.String,
          revenant_init_price: RecsType.BigInt,
          rewards_claim_status: RecsType.Number,
          status: RecsType.Number,
          max_amount_of_revenants: RecsType.Number,
        },
        {
          metadata: {
            name: "Game",
            types: [],
          },
        }
      );
    })(),
    GameEntityCounter: (() => {
      return defineComponent(
        world,
        {
          game_id: RecsType.Number,
          revenant_count: RecsType.Number,
          outpost_count: RecsType.Number,
          event_count: RecsType.Number,
          outpost_exists_count: RecsType.Number,
          remain_life_count: RecsType.Number,
          reinforcement_count: RecsType.Number,
          trade_count: RecsType.Number,
          score_count: RecsType.Number,
        },
        {
          metadata: {
            name: "GameEntityCounter",
            types: [],
          },
        }
      );
    })(),
    GameTracker: (() => {
      return defineComponent(
        world,
        { entity_id: RecsType.BigInt, count: RecsType.Number },
        {
          metadata: {
            name: "GameTracker",
            types: [],
          },
        }
      );
    })(),
    Outpost: (() => {
      return defineComponent(
        world,
        {
          game_id: RecsType.Number,
          entity_id: RecsType.BigInt,
          owner: RecsType.String,
          name_outpost: RecsType.BigInt,
          x: RecsType.Number,
          y: RecsType.Number,
          lifes: RecsType.Number,
          shield: RecsType.Number,
          reinforcement_count: RecsType.Number,
          status: RecsType.Number,
          last_affect_event_id: RecsType.BigInt,
        },
        {
          metadata: {
            name: "Outpost",
            types: [],
          },
        }
      );
    })(),
    OutpostPosition: (() => {
      return defineComponent(
        world,
        {
          game_id: RecsType.Number,
          x: RecsType.Number,
          y: RecsType.Number,
          entity_id: RecsType.BigInt,
        },
        {
          metadata: {
            name: "OutpostPosition",
            types: [],
          },
        }
      );
    })(),
    PlayerInfo: (() => {
      return defineComponent(
        world,
        {
          game_id: RecsType.Number,
          owner: RecsType.String,
          score: RecsType.Number,
          score_claim_status: RecsType.Boolean,
          earned_prize: RecsType.BigInt,
          revenant_count: RecsType.Number,
          outpost_count: RecsType.Number,
          reinforcement_count: RecsType.Number,
          inited: RecsType.Boolean,
        },
        {
          metadata: {
            name: "PlayerInfo",
            types: [],
          },
        }
      );
    })(),
    ReinforcementBalance: (() => {
      return defineComponent(
        world,
        {
          game_id: RecsType.Number,
          target_price: RecsType.BigInt,
          start_timestamp: RecsType.Number,
          count: RecsType.Number,
        },
        {
          metadata: {
            name: "ReinforcementBalance",
            types: [],
          },
        }
      );
    })(),
    Revenant: (() => {
      return defineComponent(
        world,
        {
          game_id: RecsType.Number,
          entity_id: RecsType.BigInt,
          owner: RecsType.String,
          first_name_idx: RecsType.Number,
          last_name_idx: RecsType.Number,
          outpost_count: RecsType.Number,
          status: RecsType.Number,
        },
        {
          metadata: {
            name: "Revenant",
            types: [],
          },
        }
      );
    })(),
    Trade: (() => {
      return defineComponent(
        world,
        {
          game_id: RecsType.Number,
          entity_id: RecsType.Number,
          seller: RecsType.String,
          price: RecsType.BigInt,
          count: RecsType.Number,
          buyer: RecsType.String,
          status: RecsType.Number,
        },
        {
          metadata: {
            name: "Trade",
            types: [],
          },
        }
      );
    })(),
    WorldEvent: (() => {
      return defineComponent(
        world,
        {
          game_id: RecsType.Number,
          entity_id: RecsType.BigInt,
          x: RecsType.Number,
          y: RecsType.Number,
          radius: RecsType.Number,
          destroy_count: RecsType.Number,
          block_number: RecsType.Number,
        },
        {
          metadata: {
            name: "WorldEvent",
            types: [],
          },
        }
      );
    })(),
    WorldEventTracker: (() => {
      return defineComponent(
        world,
        {
          game_id: RecsType.Number,
          event_id: RecsType.BigInt,
          outpost_id: RecsType.BigInt,
        },
        {
          metadata: {
            name: "WorldEventTracker",
            types: [],
          },
        }
      );
    })(),
  };
}

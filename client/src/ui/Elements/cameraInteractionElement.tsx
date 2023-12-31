import { useEffect } from "react";

import {
    getComponentValue,
  } from "@latticexyz/recs";

import { useDojo } from "../../hooks/useDojo";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { GAME_CONFIG_ID, MAP_HEIGHT, MAP_WIDTH } from "../../utils/settingsConstants";
import { setClientCameraComponent, setClientCameraEntityIndex } from "../../utils";
import { useWASDKeys } from "../../phaser/systems/eventSystems/keyPressListener";
import { getTileIndex } from "../../phaser/constants";

import { MenuState } from "../Pages/gamePhaseManager";

export function useCameraInteraction(menuState: MenuState) {

    const keysDown = useWASDKeys();

    const CAMERA_SPEED = 10;   ///needs to be global in the settings so it cna be changed

    let prevX: number = 0;
    let prevY: number = 0;

    const {
        networkLayer: {
          network: { clientComponents }
        },
        phaserLayer:{
          scenes: {
            Main: { camera },
          }
        }
      } = useDojo();
  
    useEffect(() => {

        if (menuState !== MenuState.NONE) {return;}

        let animationFrameId: number;
    
        let currentZoomValue = 0;
    
        // Subscribe to zoom$ observable
        const zoomSubscription = camera.zoom$.subscribe((currentZoom: any) => {
          currentZoomValue = currentZoom; // Update the current zoom value
        });
    
        const update = () => {
          const camPos = getComponentValue(
            clientComponents.ClientCameraPosition,
            getEntityIdFromKeys([BigInt(GAME_CONFIG_ID)])
          );
    
          if (!camPos) {
            console.log("failed");
            return;
          }
    
          let newX = camPos.x;
          let newY = camPos.y;
    
          if (keysDown.W || keysDown.ARROWUP) {
            newY = camPos.y - CAMERA_SPEED;
          }
          if (keysDown.A || keysDown.ARROWLEFT) {
            newX = camPos.x - CAMERA_SPEED;
          }
        
          if (keysDown.S || keysDown.ARROWDOWN) {
            newY = camPos.y + CAMERA_SPEED;
          }
          if (keysDown.D || keysDown.ARROWRIGHT) {
            newX = camPos.x + CAMERA_SPEED;
          }
    
          if (newX > MAP_WIDTH - camera.phaserCamera.width / currentZoomValue / 2) {
            newX = MAP_WIDTH - camera.phaserCamera.width / currentZoomValue / 2;
          }
          if (newX < camera.phaserCamera.width / currentZoomValue / 2) {
            newX = camera.phaserCamera.width / currentZoomValue / 2;
          }
          if (
            newY >
            MAP_HEIGHT - camera.phaserCamera.height / currentZoomValue / 2
          ) {
            newY = MAP_HEIGHT - camera.phaserCamera.height / currentZoomValue / 2;
          }
          if (newY < camera.phaserCamera.height / currentZoomValue / 2) {
            newY = camera.phaserCamera.height / currentZoomValue / 2;
          }
    
          if (newX !== prevX || newY !== prevY) {
            
            setClientCameraComponent(newX, newY, clientComponents);
    
            prevX = newX;
            prevY = newY;
    
            const camTileIndex = getComponentValue(
              clientComponents.EntityTileIndex,
              getEntityIdFromKeys([BigInt(GAME_CONFIG_ID)])
            );
    
            const newIndex = getTileIndex(newX,newY);
    
            if (newIndex !== camTileIndex.tile_index)
            {
              setClientCameraEntityIndex(newX, newY, clientComponents)
            }
          }
    
          animationFrameId = requestAnimationFrame(update);
        };
    
        update();
    
        return () => {
          cancelAnimationFrame(animationFrameId);
          zoomSubscription.unsubscribe();
        };
    }, [keysDown]);

    return {
    };
}

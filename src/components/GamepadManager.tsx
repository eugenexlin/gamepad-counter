import React from "react";
import _ from "lodash";

// inspired by
// https://github.com/luser/gamepadtest/blob/master/gamepadtest.js
// https://github.com/SBRK/react-gamepad/blob/master/src/Gamepad.js

// this class just lets you handle joystick events in the easy react way.

export interface GamepadManagerProps {
    onButtonDown?: (gamepadIndex: number, buttonIndex: number) => any;
    onButtonUp?: (gamepadIndex: number, buttonIndex: number) => any;
    onAxisChange?: (gamepadIndex: number, axisIndex: number, axisValue:number) => any;
}

let prevControllers: Gamepad[] = [];
let controllers: Gamepad[] = [];
const haveEvents = "GamepadEvent" in window;
const haveWebkitEvents = "WebKitGamepadEvent" in window;
const rAF = window.requestAnimationFrame;

const getButtonStateSafely = (
    gamepad: Gamepad,
    buttonNum: number,
): GamepadButton => {
    if (
        gamepad == undefined ||
        gamepad.buttons == undefined ||
        gamepad.buttons[buttonNum] == undefined
    ) {
        return { value: 0, pressed: false, touched: false };
    }
    return gamepad.buttons[buttonNum];
};
const getAxisSafely = (gamepad: Gamepad, axisNumber: number): number => {
    if (
        gamepad == undefined ||
        gamepad.axes == undefined ||
        gamepad.axes[axisNumber] == undefined ||
        Number.isNaN(gamepad.axes[axisNumber])
    ) {
        return 0;
    }
    return gamepad.axes[axisNumber];
};

export const GamepadManager = (props: GamepadManagerProps) => {
    const connecthandler = (e) => {
        addgamepad(e.gamepad);
    };
    const addgamepad = (gamepad) => {
        controllers[gamepad.index] = gamepad;
        console.warn(gamepad)
        rAF(updateStatus);
    };
    const disconnecthandler = (e) => {
        removegamepad(e.gamepad);
    };
    const removegamepad = (gamepad) => {
        delete controllers[gamepad.index];
    };

    function updateStatus() {
        nextGamePad();
        for (let j = 0; j < controllers.length; j++) {
            const controller = controllers[j];
            const prevController = prevControllers[j];
            for (let i = 0; i < controller.buttons.length; i++) {
                const previousBS = getButtonStateSafely(prevController, i);
                const currentBS = getButtonStateSafely(controller, i);

                if (!previousBS.pressed && currentBS.pressed) {
                    // console.log("DOWN", i);
                    if (props.onButtonDown){
                        props.onButtonDown(j, i);
                    }
                }
                if (previousBS.pressed && !currentBS.pressed) {
                    //console.log("UP", i);
                    if (props.onButtonUp){
                        props.onButtonUp(j, i);
                    }
                }
            }
            for (let i = 0; i < controller.axes.length; i++) {
                const previousAxis = getAxisSafely(prevController, i);
                const currentAxis = getAxisSafely(controller, i);
                if (previousAxis != currentAxis) {
                     console.warn(currentAxis)
                    if (props.onAxisChange){
                        props.onAxisChange(j, i, currentAxis);
                    }
                }
            }
            controller.axes;
        }
        rAF(updateStatus);
    }

    function nextGamePad() {
        prevControllers = _.cloneDeep(controllers);
        var gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        for (var i = 0; i < gamepads.length; i++) {
            if (gamepads[i] && gamepads[i].index in controllers) {
                controllers[gamepads[i].index] = gamepads[i];
            }
        }
    }

    React.useEffect(() => {
        if (haveEvents) {
            window.addEventListener("gamepadconnected", connecthandler);
            window.addEventListener("gamepaddisconnected", disconnecthandler);
        } else if (haveWebkitEvents) {
            window.addEventListener("webkitgamepadconnected", connecthandler);
            window.addEventListener(
                "webkitgamepaddisconnected",
                disconnecthandler,
            );
        } else {
            setInterval(nextGamePad, 500);
        }

        return () => {};
    }, []);

    return React.Fragment;
};

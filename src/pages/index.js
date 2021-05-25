import * as React from "react";
import { GamepadManager } from "../components/GamepadManager";

const handleButtonDown = (gamepadIndex, buttonIndex) => {
    console.info(gamepadIndex, buttonIndex, "down");
};
const handleButtonUp = (gamepadIndex, buttonIndex) => {
    console.info(gamepadIndex, buttonIndex, "up");
};
const handleAxisChange = (gamepadIndex, axisIndex, value) => {
    console.info(gamepadIndex, axisIndex, value);
};

// markup
const IndexPage = () => {
    return (
        <main>
            <title>gamepad viewer</title>
            <div>
                <GamepadManager
                    onButtonDown={handleButtonDown}
                    onButtonUp={handleButtonUp}
                    onAxisChange={handleAxisChange}
                >
                    <React.Fragment />
                </GamepadManager>
            </div>
        </main>
    );
};

export default IndexPage;

import { Box } from "@material-ui/core";
import * as React from "react";
import { HIDManager } from "../components/HIDManager";
// import { GamepadManager } from "../components/GamepadManager";

const handleButtonDown = (gamepadIndex, buttonIndex) => {
    console.warn(gamepadIndex, buttonIndex, "down");
};
const handleButtonUp = (gamepadIndex, buttonIndex) => {
    console.warn(gamepadIndex, buttonIndex, "up");
};
const handleAxisChange = (gamepadIndex, axisIndex, value) => {
    console.warn(gamepadIndex, axisIndex, value);
};

// markup
const IndexPage = () => {
    return (
        <main>
            <title>gamepad viewer</title>
            <Box padding={2}>
                <HIDManager
                    // onButtonDown={handleButtonDown}
                    // onButtonUp={handleButtonUp}
                    // onAxisChange={handleAxisChange}
                ></HIDManager>
            </Box>
        </main>
    );
};

export default IndexPage;

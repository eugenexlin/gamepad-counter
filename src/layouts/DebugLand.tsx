import React from "react";
import _ from "lodash";
import { Box, FormControl, Grid, Paper, TextField } from "@material-ui/core";
import { HIDManager, EasyInputFormat } from "../components/HIDManager";
import { ButtonList } from "../components/ButtonList";

export const DebugLand = () => {
    const [inputReports, setInputReports] = React.useState<EasyInputFormat[]>(
        [],
    );

    const handleInputReport = (index: number, report: EasyInputFormat) => {
        let newInputReports = inputReports.slice();
        newInputReports[index] = report;
        setInputReports(newInputReports);
    };

    return (
        <>
            <Box marginBottom={3}>
                <HIDManager onInputReport={handleInputReport}></HIDManager>
            </Box>
            {inputReports.map((inputReport, i) => {
                const easyInputReport = inputReports[i];
                return (
                    <Box key={i}>
                        <FormControl fullWidth>
                            <Paper>
                                <Box margin={1}>
                                    <FormControl fullWidth>
                                        <TextField
                                            multiline={true}
                                            value={inputReport.deviceName}
                                        ></TextField>
                                    </FormControl>
                                </Box>
                                <Box margin={1}>
                                    <FormControl fullWidth>
                                        <TextField
                                            multiline={true}
                                            value={inputReport.rawData}
                                        ></TextField>
                                    </FormControl>
                                </Box>
                                <Box margin={1}>
                                    {easyInputReport && (
                                        <ButtonList
                                            button={easyInputReport.button}
                                        />
                                    )}
                                </Box>
                            </Paper>
                        </FormControl>
                    </Box>
                );
            })}
        </>
    );
};

import * as React from 'react';
import { Fragment } from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {ArrowForwardIos, ArrowBackIosNew, RestartAlt} from '@mui/icons-material';


import Step1_Create from '../pages/steps/Step1_Create'
import Step2_Fund from '../pages/steps/Step2_Fund'
import Step3_Mint from '../pages/steps/Step3_Mint';
import Step4_Transfer from '../pages/steps/Step4_Transfer';
import { Divider, IconButton, Stack } from '@mui/material';

const steps = ['Create new contract', 'Fund your contract', 'Mint tokens', 'Transfer to retailer'];

export default function MasterStepper() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());

  const isStepOptional = (step: number) => {
    // return step === 1;
    return false;
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: {
            optional?: React.ReactNode;
          } = {};
          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography variant="caption">Optional</Typography>
            );
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps} sx={{color: "red"}}>
              <StepLabel {...labelProps} style={{ cursor: "pointer" }} onClick={() => setActiveStep(index)}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>

      <Stack direction="row" width="100%" mt={6} mb={6} spacing={4}
        alignItems="stretch"
        // divider={<Divider orientation="vertical" flexItem />}
        justifyContent="space-between"
      >

        <Stack alignItems="center" justifyContent="center" >
          <IconButton color="inherit" disabled={activeStep === 0} onClick={handleBack} ><ArrowBackIosNew /></IconButton>
        </Stack>

        <Box
          component="form"
          sx={{ mt: 6, ml: 5, mr: 5, mb: 3, display: "flex", width: "100%" }}
          noValidate
          autoComplete="off"
        >
          {activeStep == 0 && <Step1_Create />}
          {activeStep == 1 && <Step2_Fund />}
          {activeStep == 2 && <Step3_Mint />}
          {activeStep == 3 && <Step4_Transfer />}

        </Box>

        <Stack alignItems="center" justifyContent="center" >
          {activeStep === steps.length - 1 ? (<IconButton onClick={handleReset}><RestartAlt /></IconButton>) : (<IconButton onClick={handleNext}><ArrowForwardIos /></IconButton>)}
        </Stack>

      </Stack>

    </Box>
  );
}
import { Button, CircularProgress, Paper, Stack, TextField } from "@mui/material";
import { useContract, useContractEvents, useContractWrite, useSDK } from "@thirdweb-dev/react";
import { useState } from 'react';

import toast from "react-hot-toast";



export default function Step1_CreateContract() {

  const masterAddr: string = import.meta.env.VITE_MASTER_ADDR;
  const { contract } = useContract(masterAddr);
  const { mutateAsync: createContract, isLoading: isWriting } = useContractWrite(contract, "createContract");
  const { data: contractCreatedEvent } = useContractEvents(contract, "ClientContractCreated");

  const [uri, setUri] = useState("");
  const sdk = useSDK();
  const connected = sdk?.wallet.isConnected();
  

  const call = async (_uri: string) => {
    try {
      const data = await createContract({ args: [_uri] });
      const createdAddr = contractCreatedEvent && contractCreatedEvent.pop()?.data.contractAddress;
      console.log("Contract successfuly created at:", createdAddr);
      toast.success("Contract successfuly created.");
      return data;
    } catch (err) {
      console.error("Contract call failure", err);
      toast.error("An error has occured\nCheck console log");
    }
  }


  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      spacing={0}
      width="100%"
      component={Paper}
      sx={{ p: 2 }}
    >
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
        <TextField 
          id="contract_uri" 
          label="Contract URI" 
          onChange={(e) => 
          setUri(e.target.value)} 
          placeholder="https://your_domain.com/{id}.json" 
          variant="outlined" 
          sx={{ width: '50ch', bgcolor: "#181818" }}
          autoFocus />

        <Button 
          onClick={() => call(uri)} 
          disabled={!connected} 
          variant="contained" 
          color="primary" 
          sx={{width: "25ch", minHeight:"50px", maxHeight: "50px"}}>
            {!connected ? "Disconnected" : isWriting ? <CircularProgress size="1.5rem" color="inherit" /> : "Create contract"}
        </Button>
        
      </Stack>
    </Stack >
  )
}


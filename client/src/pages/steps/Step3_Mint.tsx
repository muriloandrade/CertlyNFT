import { Box, FormControl, Grid, InputLabel, Paper, Table, TableCell, TableBody, TableContainer, TableHead, TableRow, TextField, Stack, Button, CircularProgress, Tooltip } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useAddress, useContract, useContractEvents, useContractWrite, useSDK } from '@thirdweb-dev/react';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { abi } from '../../components/ClientContractAbi';
import toast from "react-hot-toast";


export default function Step3_Mint() {

  type Row = {
    tokenId: string;
    amount: string;
  }

  const [contractAddresses, setContractAddresses] = useState<string[]>();
  const [contractSelected, setContractSelected] = useState<string>('');
  const [rows, setRows] = useState<Row[]>(new Array<Row>(3).fill({ tokenId: '', amount: '' }));
  const [isCalling, setIsCalling] = useState(false);


  const sdk = useSDK();
  const connected = sdk?.wallet.isConnected();
  const address = useAddress();
  const masterAddr: string = import.meta.env.VITE_MASTER_ADDR;
  const { contract: masterContract } = useContract(masterAddr);
  const { data: createdEv } = useContractEvents(masterContract, "ClientContractCreated");  

  const handleChange = (event: SelectChangeEvent<string>) => {
    setContractSelected(event.target.value);
  };


  useEffect(() => {
    let _addresses: string[] = [];
    createdEv?.filter((event) => event.data.client == address).map(async (event, index) => {
      _addresses.push(event.data.contractAddress);
    });

    setContractAddresses(_addresses);

  });


  function handleTokenIdChange(e: ChangeEvent, index: number) {
    var result = rows.map((r, i) => {
      if (i == index) return { ...r, tokenId: (e.target as HTMLInputElement).value };
      return r;
    })
    setRows(result);
  }

  function handleAmountChange(e: ChangeEvent, index: number) {
    var result = rows.map((r, i) => {
      if (i == index) return { ...r, amount: (e.target as HTMLInputElement).value };
      return r;
    })
    setRows(result);
  }

  async function call() {

    const tokensIds = rows.filter((r) => r.tokenId && r.amount).map((r) => r.tokenId);
    const amounts = rows.filter((r) => r.tokenId && r.amount).map((r) => r.amount);

    try {
      setIsCalling(true);
      const clientContract = await sdk?.getContract(contractSelected, abi);
      clientContract!.interceptor.overrideNextTransaction(() => ({gasLimit: 3000000,}));
      const data = await clientContract!.call("mintTokenBatch", [tokensIds, amounts]);
      console.log("Tokens minted successfuly", data);
      toast.success("Tokens minted successfuly");
    } catch (err) {
      console.error("Contract call failure", err);
      toast.error("An error has occured\nCheck console log");
    } finally {
      setIsCalling(false);
    }
  }

  return (

    <Grid container direction="row" justifyContent="space-evenly"
      component={Paper} p={3}>
      <Grid item pt={4}>
        <Box>
          <FormControl sx={{ m: 1, minWidth: 400 }}>
            <InputLabel id="contracts-label">Contract</InputLabel>
            <Select
              labelId="contract-select"
              id="contract-select"
              value={contractSelected}
              onChange={(event) => handleChange(event)}
              autoWidth
              label="contracts"
              sx={{ bgcolor: "#181818" }}
              autoFocus
            >
              {contractAddresses?.map((addr, index: number) => (
                <MenuItem key={index} value={addr}>{addr}</MenuItem>
              ))}
            </Select>
          </FormControl></Box>
      </Grid>
      <Grid item>
        <Box>


          <Grid container spacing={2} direction="column" >
            <Grid item>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="left" sx={{ borderBottom: 0, pl: 0, pt: 0 }}>Token ID</TableCell>
                      <TableCell align="right" sx={{ width: "10ch", borderBottom: 0, pt: 0 }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row: Row, index: number) => {
                      return (
                        <TableRow key={index}>
                          <TableCell align="left" sx={{ p: 0, borderBottom: 0, bgcolor: "#181818" }}>
                            <TextField value={row.tokenId} disabled={!contractSelected} onChange={(e) => handleTokenIdChange(e, index)} /></TableCell>
                          <TableCell align="right" sx={{ p: 0, borderBottom: 0, bgcolor: "#181818" }}>
                            <TextField value={row.amount} disabled={!contractSelected} onChange={(e) => handleAmountChange(e, index)} /></TableCell>
                        </TableRow>
                      )
                    })}


                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item >
              <Stack>

                <Button
                  onClick={() => call()}
                  disabled={!connected || isCalling || !contractSelected}
                  variant="contained"
                  color="primary"
                  sx={{ width: "100%", minHeight: "45px", maxHeight: "45px" }}>
                  {!connected ? "Disconnected" : !contractSelected ? "Select contract" : isCalling ? <CircularProgress size="1rem" color="inherit" /> : "Mint Tokens"}
                </Button>

              </Stack>
            </Grid>
          </Grid>

        </Box>
      </Grid>
    </Grid>
  )
}
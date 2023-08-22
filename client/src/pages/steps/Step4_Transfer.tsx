import { Box, Button, CircularProgress, FormControl, Grid, InputLabel, Paper, Select, SelectChangeEvent, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import { SmartContract, useAddress, useContract, useContractEvents, useSDK } from '@thirdweb-dev/react';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { abi } from '../../components/ClientContractAbi';


export default function Step4_Transfer() {

  type Row = {
    tokenId: string;
    amount: string;
    stock: string;
  }

  const [contractAddresses, setContractAddresses] = useState<string[]>();
  const [contractSelected, setContractSelected] = useState<string>('');
  const [rows, setRows] = useState<Row[]>(new Array<Row>(3).fill({ tokenId: '', stock: '', amount: '' }));
  const [isCalling, setIsCalling] = useState(false);
  const [clientContract, setClientContract] = useState<SmartContract>();
  const [retailer, setRetailer] = useState<string>();


  const sdk = useSDK();
  const connected = sdk?.wallet.isConnected();
  const address = useAddress();
  const masterAddr: string = import.meta.env.VITE_MASTER_ADDR;
  const { contract: masterContract } = useContract(masterAddr);
  const { data: createdEv } = useContractEvents(masterContract, "ClientContractCreated");
  const { data: mintedTokensEv } = useContractEvents(clientContract, "MintedTokens");



  const handleChange = (event: SelectChangeEvent<string>) => {
    setContractSelected(event.target.value);
  };

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

  function handleRetailerChange(e: ChangeEvent) {
    setRetailer((e.target as HTMLInputElement).value);
  }


  useEffect(() => {
    let _addresses: string[] = [];
    createdEv?.filter((event) => event.data.client == address).map(async (event, index) => {
      _addresses.push(event.data.contractAddress);
    });

    setContractAddresses(_addresses);

  });

  async function retreiveTokenStock(tokenId: string, index: number) {

    const id_amount = new Map<string, string>();

    mintedTokensEv?.map((e) => {
      for (let i = 0; i < e.data.ids.length; i++) {
        id_amount.set(String(e.data.ids[i]), String(id_amount.get(e.data.ids[i]) ?  id_amount.get(e.data.ids[i]) + e.data.amounts[i] : e.data.amounts[i]));
      }
    })

    const _rows = rows.map((r: Row, i: number) => {
      return id_amount.has(String(r.tokenId)) ? {...r, stock: id_amount.get(r.tokenId) || ''} : {...r, stock: ''};
    })
    setRows(_rows);
 
  }

  const retrieveAndSetClientContract = useCallback(async () => {
    if (contractSelected) {
      const clientContract = await sdk?.getContract(contractSelected, abi);
      setClientContract(clientContract);
    }
  }, [contractSelected]);

  useEffect(() => {
    retrieveAndSetClientContract();
  }, [contractSelected])

  

  async function call() {

    const tokensIds = rows.filter((r) => r.tokenId && r.amount).map((r) => r.tokenId);
    const amounts = rows.filter((r) => r.tokenId && r.amount).map((r) => r.amount);

    try {
      setIsCalling(true);
      const clientContract = await sdk?.getContract(contractSelected, abi);
      clientContract!.interceptor.overrideNextTransaction(() => ({gasLimit: 3000000,}));
      const data = await clientContract!.call("safeBatchTransferFrom", [address, retailer, tokensIds, amounts, []]);
      console.log("Tokens successfuly transferred", data);
      toast.success("Tokens successfuly transferred");
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
                      <TableCell align="left" sx={{ width: "100%", borderBottom: 0, pl: 0, pt: 0 }}>Token ID</TableCell>
                      <TableCell align="center" sx={{ width: "10ch", borderBottom: 0, pt: 0 }}>Amount</TableCell>
                      <TableCell align="center" sx={{ width: "1", border: 0, p: 0, m: 0, }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>

                    {rows.map((row: Row, index: number) => {
                      return (
                        <TableRow key={index}>
                          <TableCell align="left" sx={{ p: 0, borderBottom: 0, bgcolor: "#181818" }}>
                            <TextField value={row.tokenId} disabled={!contractSelected} sx={{ width: "100%" }} onChange={(e) => handleTokenIdChange(e, index)} onBlur={() => retreiveTokenStock(row.tokenId, index)} /></TableCell>
                          <TableCell align="center" sx={{ p: 0, borderBottom: 0, bgcolor: "#181818" }}>
                            <TextField value={row.amount} disabled={!contractSelected} onChange={(e) => handleAmountChange(e, index)} /></TableCell>
                          <TableCell align="center" sx={{ pl: 1, borderBottom: 0, m:0}}>
                            <Typography variant="subtitle2" color="gray">{row.stock}</Typography></TableCell>
                        </TableRow>
                      )
                    })}

                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item>
              <Stack
                direction="row"
                justifyContent="flex-end"
                alignItems="center"
                spacing={0}
                mr={3}>
                <TextField disabled={!contractSelected}  label="Retailer Address" size="small" sx={{ width: '30ch' }} onChange={(e) => handleRetailerChange(e)} />
                
                <Button
                  onClick={() => call()}
                  disabled={!connected || isCalling || !contractSelected || !retailer}
                  variant="contained"
                  color="primary"
                  sx={{ width: "15ch", minHeight: "45px", maxHeight: "45px" }}>
                  {!connected ? "Disconnected" : !contractSelected ? "Select contract" : isCalling ? <CircularProgress size="1rem" color="inherit" /> : "Transfer"}
                </Button>

              </Stack>
            </Grid>

          </Grid>
        </Box>
      </Grid>
    </Grid>


  )
}
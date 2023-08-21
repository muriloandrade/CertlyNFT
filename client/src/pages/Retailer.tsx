import { Button, CircularProgress, Grid, Box, Paper, SelectChangeEvent, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import { SmartContract, useAddress, useContract, useContractEvents, useSDK } from '@thirdweb-dev/react';
import { ChangeEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { ContractMissingDeployDataError, Web3 } from 'web3';
import { BigNumber } from 'ethers';
import { abi } from '../components/ClientContractAbi';
import FileUploader from '../components/FileUploader';
import { ethers } from 'ethers'


export default function Retailer() {

  type Row = {
    contract: string;
    tokenId: string;
    amount: string;
    stock: string;
  }

  const [rows, setRows] = useState<Row[]>(new Array<Row>(3).fill({ contract: '', tokenId: '', amount: '', stock: '' }));
  const [isCalling, setIsCalling] = useState(false);
  const [invoice, setInvoice] = useState<string>('');
  const [password, setPassword] = useState<string>('');


  const sdk = useSDK();
  const connected = sdk?.wallet.isConnected();

  function handleContractChange(e: ChangeEvent, index: number) {
    var result = rows.map((r, i) => {
      if (i == index) return { ...r, contract: (e.target as HTMLInputElement).value };
      return r;
    })
    setRows(result);
  }

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

  function handlePasswordChange(e: ChangeEvent) {

    setPassword((e.target as HTMLInputElement).value);
  }

  async function call() {

    const contracts: string[] = rows.filter((row) => row.contract && row.tokenId && row.amount).map((r) => r.contract.trim()).filter((r, i, a) => a.indexOf(r) === i)

    const tokensIds = new Map<string, string[]>; //client_tokensIds

    //tokensId repeats amount per contract
    contracts.map((c, i) => {
      let t: string[] = [];
      rows.filter((row) => row.contract && row.tokenId && row.amount).map((r, j) => {
        const a: string[] = Array(parseInt(r.amount)).fill(r.tokenId);
        if (r.contract == c) t.push(...a);
      })
      tokensIds.set(c, t)
    })

    const web3 = new Web3();
    const invoiceHash = web3.utils.soliditySha3({ type: "string", value: invoice });
    const passwordHash = web3.utils.soliditySha3({ type: "string", value: password });
    const hash = web3.utils.soliditySha3({ type: "bytes", value: invoiceHash }, { type: "bytes", value: passwordHash });


    try {
      setIsCalling(true);
      for (let i = 0; i < contracts.length; i++) {
        const clientContract = await sdk?.getContract(contracts[i].trim(), abi);
        const data = await clientContract!.call("tokensToNftsPending", [hash, tokensIds.get(contracts[i])]);
        console.log("NFTs sent to Holder", data);
        toast.success("Success. NFTs available to be claimed");
      }
    } catch (err) {
      console.error("Contract call failure", err);
      toast.error("An error has occured\nCheck console log");
    } finally {
      setIsCalling(false);
    }
  }


  return (

    <Grid container direction="column" alignItems="center"
      justifyContent="flex-end" component={Paper} p={3} ml={-2} spacing={4} >

      <Grid item>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="left" sx={{ width: "60ch", borderBottom: 0, pl: 0, pt: 0 }}>Contract</TableCell>
                <TableCell align="left" sx={{ width: "20ch", borderBottom: 0, pl: 0, pt: 0 }}>Token ID</TableCell>
                <TableCell align="center" sx={{ width: "10ch", borderBottom: 0, pt: 0 }}>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>

              {rows.map((row: Row, index: number) => {
                return (
                  <TableRow key={index}>
                    <TableCell align="left" sx={{ p: 0, borderBottom: 0, bgcolor: "#181818" }}>
                      <TextField value={row.contract} sx={{ width: "100%" }} onChange={(e) => handleContractChange(e, index)} /></TableCell>
                    <TableCell align="left" sx={{ p: 0, borderBottom: 0, bgcolor: "#181818" }}>
                      <TextField value={row.tokenId} sx={{ width: "100%" }} onChange={(e) => handleTokenIdChange(e, index)} /></TableCell>
                    <TableCell align="center" sx={{ p: 0, borderBottom: 0, bgcolor: "#181818" }}>
                      <TextField value={row.amount} onChange={(e) => handleAmountChange(e, index)} /></TableCell>
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
          justifyContent="center"
          alignItems="center"
          spacing={2}>
          <FileUploader setInvoice={setInvoice} />
          <TextField label="Password" value={password} onChange={(event) => handlePasswordChange(event)} size="small" type="password" sx={{ width: '15ch' }} />

          <Button
            onClick={() => call()}
            disabled={!connected || isCalling || !invoice || !password}
            variant="contained"
            color="primary"
            sx={{ width: "15ch", minHeight: "45px", maxHeight: "45px" }}>
            {!connected ? "Disconnected" : isCalling ? <CircularProgress size="1rem" color="inherit" /> : "Send NFT"}
          </Button>
        </Stack>

      </Grid>

    </Grid>
  )
}
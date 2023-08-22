import { Button, CircularProgress, InputAdornment, OutlinedInput, Paper, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import { Fragment } from 'react';
import { useAddress, useContract, useContractEvents, useSDK } from "@thirdweb-dev/react";
import { BigNumber } from 'ethers';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import toast from "react-hot-toast";


export default function Step2_Fund() {

  type Row = {
    address: string;
    uri: string;
    balance?: string;
  }

  const sdk = useSDK();
  const connected = sdk?.wallet.isConnected();
  const address = useAddress();
  const masterAddr: string = import.meta.env.VITE_MASTER_ADDR;
  const { contract } = useContract(masterAddr);
  const { data: createdEvents, isLoading } = useContractEvents(contract, "ClientContractCreated");


  const [rows, setRows] = useState<Row[]>();
  const [values, setValues] = useState<String[]>(new Array<String>(30).fill(''));
  const [sendings, setSendings] = useState<Boolean[]>(new Array<Boolean>(30).fill(false));

  const getBalances = useCallback(async (promises: Promise<BigNumber>[], _rows: Row[]) => {
    Promise.all(promises).then((result) => {
      const __rows: Row[] = [];
      _rows?.map((row, index) => {
        __rows.push({ ...row, balance: String(result[index]) })
      })
      __rows.length > 0 && setRows(__rows);
    });
  }, [rows]);


  const updateBalance: any = useCallback(() => {
    let _promises: Promise<BigNumber>[] = [];
    let _rows: Row[] = [];

    createdEvents?.filter((event) => event.data.client == address).map(async (event, index) => {
      let row = rows && { ...rows[index], address: event.data.contractAddress, uri: event.data.uri };
      row && _rows.push(row);
      _promises.push(sdk?.getProvider().getBalance(event.data.contractAddress) as Promise<BigNumber>);
    });
    setRows(_rows);
    getBalances(_promises, _rows);

  }, [createdEvents, address]);

  useEffect(() => {
    updateBalance();
  }, [createdEvents, address])

  useEffect(() => {
    rows && setSendings(new Array<Boolean>(rows.length).fill(false));
    rows && setValues(new Array<String>(rows.length).fill(''));
  }, [rows])

  function updateSendings(index: number, value: boolean) {

    const _sendings = sendings.map((s, i) => {
      if (i == index) return value;
      return s;
    });
    setSendings(_sendings);
  }


  async function sendTransaction(to: string, value: string, index: number) {

    updateSendings(index, true);
    try {
      const tx = { to: to, value: value, gasLimit: 3000000 }
      const txResult = await sdk?.wallet.sendRawTransaction(tx);
      console.log("Send success:", txResult);
      toast.success("Success");
      updateBalance();
    } catch (err) {
      console.error("Send failure:", err);
      toast.error("An error has occured\nCheck console log");
    } finally {
      updateSendings(index, false);
    }
  }

  function handleValue(e: ChangeEvent, index: number) {
    var result = values.map((v, i) => {
      if (i == index) return (e.target as HTMLInputElement).value;
      return v;
    })
    setValues(result);
  }

  return (
    <Fragment>
      
      <TableContainer component={Paper} sx={{ width: '100%' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="left">Contract Address</TableCell>
              <TableCell align="center">Balance (wei)</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>

            {isLoading && (
              <TableRow>
                <TableCell align="left"><Typography variant="h5" ><Skeleton animation="wave" /></Typography></TableCell>
                <TableCell align="left"><Typography variant="h5" ><Skeleton animation="wave" /></Typography></TableCell>
                <TableCell align="left"><Typography variant="h5" ><Skeleton animation="wave" /></Typography></TableCell>
              </TableRow>
            )}

            {rows?.map((row, index) => {

              return (
                <TableRow key={row.address} >
                  <TableCell align="left"><Tooltip title={row.uri}><Typography color="gray">{row.address}</Typography></Tooltip></TableCell>
                  <TableCell align="center"><Typography color="gray">{row.balance ? row.balance : <CircularProgress size="1.5rem" color="inherit" />}</Typography></TableCell>
                  <TableCell>
                    <Stack direction="row" sx={{ margin: 'auto', justifyContent: 'right' }}>
                      <OutlinedInput
                        id="amount"
                        size="small"
                        sx={{ bgcolor: "#181818" }}
                        endAdornment={<InputAdornment position="end">wei</InputAdornment>}
                        onChange={(e) => handleValue(e, index)}
                        defaultValue={values[index]!}
                      />
                      <Button
                        onClick={() => sendTransaction(row.address, String(values[index]), index)}
                        disabled={!connected || sendings!.some((e) => e == true)}
                        variant="contained"
                        color="secondary"
                        sx={{ ml: 2, width: "12ch" }}>
                        {!connected ? "Disconnected" : sendings[index]! ? <CircularProgress size="1rem" color="inherit" /> : "Send"}
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              )
            }
            )}
          </TableBody>
        </Table>
      </TableContainer>

    </Fragment >
  )
}
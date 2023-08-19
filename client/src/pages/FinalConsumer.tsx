import { Button, CircularProgress, Divider, Stack, TextField } from '@mui/material';
import { useContract, useContractEvents, useContractWrite, useAddress, useSDK } from "@thirdweb-dev/react";
import { ChangeEvent, Fragment, useEffect, useState } from 'react';
import Web3 from 'web3';
import FileUploader from '../components/FileUploader';
import NftsTable from '../components/NftsTable';

import toast from "react-hot-toast";

export type NftType = {
  seller: string;
  owner: string;
  uri: string;
  id: string;
  timestamp: string;
}

export default function FinalConsumer() {


  const holderAddr: string = import.meta.env.VITE_MASTER_ADDR;
  const { contract } = useContract(holderAddr);
  const { mutateAsync: claimNFTs, isLoading: isWriting } = useContractWrite(contract, "claimNFTs");
  const { data: nftsRedeemedEvents } = useContractEvents(contract, "NftsRedeemed");

  const [invoiceHash, setInvoiceHash] = useState<string>();
  const [passwordHash, setPasswordHash] = useState<string>();
  const [nfts, setNfts] = useState<NftType[]>();

  const sdk = useSDK();
  const connected = sdk?.wallet.isConnected();
  const address = useAddress();

  function handlePasswordChange(e: ChangeEvent) {
    if ((e.target as HTMLInputElement).value) {
      const pwdHash = Web3.utils.soliditySha3({ type: "string", value: (e.target as HTMLInputElement).value })
      setPasswordHash(pwdHash);
    } else {
      setPasswordHash('');
    }
  }

  useEffect(()=> {
    
    let _nfts: NftType[] = [];

    nftsRedeemedEvents?.filter((e) => e.data.owner == address).map((e, i) => {
      let nft: NftType = {
        seller: e.data.seller,
        owner: e.data.owner,
        uri: e.data.uri,
        id: e.data.id,
        timestamp: e.data.timestamp
      }
      _nfts.push(nft);
    })
    setNfts(_nfts);
  })

  

  async function call() {

    try {
      const data = await claimNFTs({ args: [invoiceHash, passwordHash] });
      console.log("NFTs successfully redeemed", data);
      toast.success("Success. NFTs available to be claimed");
    } catch (err) {
      console.error("Contract call failure", err);
      toast.error("An error has occured\nCheck console log");
    }
  }

  return (
    <Fragment>

      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        spacing={3}
        height="100%"
        divider={<Divider orientation="horizontal" flexItem />}
        sx={{ mb: 10 }}
      >

        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}>
          <FileUploader setInvoiceHash={setInvoiceHash} />
          <TextField label="Password" onChange={(event) => handlePasswordChange(event)} size="small" type="password" sx={{ width: '15ch' }} />

          <Button
            onClick={() => call()}
            disabled={!connected || isWriting || !invoiceHash || !passwordHash}
            variant="contained"
            color="primary"
            sx={{ width: "15ch", minHeight: "45px", maxHeight: "45px" }}>
            {!connected ? "Disconnected" : isWriting ? <CircularProgress size="1rem" color="inherit" /> : "Send NFT"}
          </Button>
        </Stack>

        <NftsTable nfts={nfts} />
      </Stack>
    </Fragment>
  )
}

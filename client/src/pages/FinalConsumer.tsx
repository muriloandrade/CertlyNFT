import { Button, CircularProgress, Divider, Stack, TextField } from '@mui/material';
import { useAddress, useContract, useContractEvents, useContractWrite, useSDK, useWallet } from "@thirdweb-dev/react";
import { BigNumber, ethers } from 'ethers';
import { ChangeEvent, Fragment, useEffect, useState } from 'react';
import Web3 from 'web3';
import FileUploader from '../components/FileUploader';
import NftsTable from '../components/NftsTable';

import { GelatoRelay } from "@gelatonetwork/relay-sdk";
import toast from 'react-hot-toast';

export type NftType = {
  seller: string;
  owner: string;
  uri: string;
  id: number;
  timestamp: number;
}

export default function FinalConsumer() {


  const holderAddr: string = import.meta.env.VITE_HOLDER_ADDR;
  const { contract: holder } = useContract(holderAddr);
  const { mutateAsync: claimNFTs, isLoading: isWriting } = useContractWrite(holder, "claimNFTs");
  const { data: nftsRedeemedEvents } = useContractEvents(holder, "NftsRedeemed");  
  const   wallet = useWallet();

  const relay = new GelatoRelay();
  const apiKey = import.meta.env.VITE_GELATO_API_KEY;

  const [invoice, setInvoice] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [nfts, setNfts] = useState<NftType[]>();

  const sdk = useSDK();
  const connected = sdk?.wallet.isConnected();
  const address = useAddress();


  function handlePasswordChange(e: ChangeEvent) {

    setPassword((e.target as HTMLInputElement).value);
  }

  useEffect(() => {

    let _nfts: NftType[] = [];
    
    nftsRedeemedEvents?.map((e, i) => {

      const timestamp = (e.data._timestamp as unknown as BigNumber).toNumber();
      
      (e.data._nfts as NftType[]).filter((e) => e.owner == address ).map((e) => {

        let nft: NftType = {
          seller: e.seller,
          owner: e.owner,
          uri: e.uri,
          id: (e.id as unknown as BigNumber).toNumber(),
          timestamp: timestamp
        }
        
        _nfts.push(nft);
      })
    })
    _nfts.length > 0 && setNfts(_nfts);
    
  }, [nftsRedeemedEvents])


  async function call() {

    const web3 = new Web3();
    const invoiceHash = web3.utils.soliditySha3({ type: "string", value: invoice });
    const passwordHash = web3.utils.soliditySha3({ type: "string", value: password });    

    try {
      const data = holder?.encoder.encode('claimNFTs', [invoiceHash as string, passwordHash as string]);
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // Populate a relay request
      const request = {
        chainId: 59140 as any,
        target: holderAddr,
        data: data as string,
        user: address as string,
      };

      const relayResponse = await relay.sponsoredCallERC2771(request, provider as any, apiKey);
      console.log("NFTs successfuly withdrawn", relayResponse);
      toast.success("NFTs successfuly withdrawn");


    } catch (e) {
      console.error("Contract call failure", e);
      toast.error("An error has occured\nCheck console log");
      console.log(e);
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
          <FileUploader setInvoice={setInvoice} />
          <TextField label="Password" value={password} onChange={(event) => handlePasswordChange(event)} size="small" type="password" sx={{ width: '15ch' }} />

          <Button
            onClick={() => call()}
            disabled={!connected || isWriting || !invoice || !password}
            variant="contained"
            color="primary"
            sx={{ width: "20ch", minHeight: "45px", maxHeight: "45px" }}>
            {!connected ? "Disconnected" : isWriting ? <CircularProgress size="1rem" color="inherit" /> : "Claim NFTs"}
          </Button>
        </Stack>

        <NftsTable nfts={nfts} />
      </Stack>
    </Fragment>
  )
}

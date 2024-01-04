import { Link, Skeleton, TableCell, TableRow, Typography } from "@mui/material";
import { SmartContract, ThirdwebNftMedia, useNFT, useSDK } from "@thirdweb-dev/react";
import { useCallback, useEffect, useState } from "react";
import { NftType } from "../pages/FinalConsumer";
import { abi } from './ClientContractAbi';

interface NftRowProps {
  nft: NftType;
}

export default function NftRow(props: NftRowProps) {

  const sdk = useSDK();
  const { nft } = props;
  const [contract, setContract] = useState<SmartContract>();
  const { data: nftData, isLoading, error } = useNFT(contract, nft.id);


  const getContract = useCallback(async () => {

    setContract(await sdk?.getContract(nft.seller, abi));

  }, [nft]);

  useEffect(() => {

    getContract();

  }, [nft]);



  // https://johnumarattil.medium.com/truncating-middle-portion-of-a-string-in-javascript-173bfe1f9ae3
  function truncateString(str: string, firstCharCount = str?.length, endCharCount = 0, dotCount = 3) {
    if (str.length <= firstCharCount + endCharCount) {
      return str; // No truncation needed
    }

    const firstPortion = str.slice(0, firstCharCount);
    const endPortion = str.slice(-endCharCount);
    const dots = '.'.repeat(dotCount);

    return `${firstPortion}${dots}${endPortion}`;
  }

  
  if (isLoading) return (
    <TableRow>
      <TableCell><Skeleton /></TableCell>
      <TableCell><Skeleton /></TableCell>
      <TableCell><Skeleton /></TableCell>
      <TableCell><Skeleton /></TableCell>
    </TableRow>
  )
  if (error || !nftData) return <TableRow><TableCell>NFT not found</TableCell></TableRow>;

  return (
    <TableRow
      key={nft.seller + nft.id}
      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    >
      <TableCell align='center'>
        <ThirdwebNftMedia metadata={nftData.metadata} width="100px" height="100px" />
      </TableCell>
      <TableCell align='center'>
        <Typography color='grey'>{nftData.metadata.title as string}</Typography>
      </TableCell>
      <TableCell align='center'>
        <Typography color='grey'>
          <Link href={nftData.metadata.uri?.replace("{id}", nftData.metadata.id.toString())}>{truncateString(nftData.metadata.uri?.replace("{id}", nftData.metadata.id.toString()), 25, 20)}</Link>
        </Typography>
      </TableCell>
      <TableCell align='center'>
        <Typography color='grey'>{new Date(nft.timestamp*1000).toLocaleDateString()}</Typography>
      </TableCell>

    </TableRow>
  )
}
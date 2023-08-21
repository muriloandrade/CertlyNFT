import { SmartContract, ThirdwebNftMedia, useContract, useNFT, useSDK } from "@thirdweb-dev/react";
import { abi } from './ClientContractAbi';
import { useCallback, useState } from "react";
import { BigNumber } from "ethers";

interface NftProps {
  clientAddress: string;
  id: BigNumber;
}


export default function NFT(props: NftProps) {
  
  const sdk = useSDK();
  const { clientAddress, id } = props;
  const [contract, setContract] = useState<SmartContract>();
  const { data: nft, isLoading, error } = useNFT(contract, id);
  
  const getContract = useCallback(async () => {
    
    setContract(await sdk?.getContract(clientAddress, abi));

  }, [clientAddress]);

  getContract();

  console.log("NFT DATA", nft)
  // console.log("Address", clientAddress)
  // console.log("ID", id)
  // console.log("Contract", contract)

  // Render the NFT onto the UI
  if (isLoading) return <div>Loading...</div>;
  if (error || !nft) return <div>NFT not found</div>;

  return <ThirdwebNftMedia metadata={nft.metadata} width="100px" height="100px" />;
}
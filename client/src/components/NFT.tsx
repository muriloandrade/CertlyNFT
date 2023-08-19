import { ThirdwebNftMedia, useContract, useNFT } from "@thirdweb-dev/react";

interface NftProps {
  clientAddress: string;
  id: string
}

export default function NFT(props: NftProps) {

  const {clientAddress, id} = props;

  // Connect to your NFT contract
  const { contract } = useContract(clientAddress);

  // Load the NFT metadata from the contract using a hook
  const { data: nft, isLoading, error } = useNFT(contract, id);

  // Render the NFT onto the UI
  if (isLoading) return <div>Loading...</div>;
  if (error || !nft) return <div>NFT not found</div>;

  return <ThirdwebNftMedia metadata={nft.metadata} />;
}
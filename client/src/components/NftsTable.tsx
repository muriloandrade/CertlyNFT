import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Fragment } from 'react';
import { NftType } from '../pages/FinalConsumer';
import NftRow from './NftRow';


interface NftsTableProps {
  nfts: NftType[] | undefined;
}


export default function NftsTable(props: NftsTableProps) {

  const { nfts } = props;

  return (
    <TableContainer component={Paper} >
      <Table>
        <TableHead>
          <TableRow>

            <Fragment>
              <TableCell align="center">Media</TableCell>
              <TableCell align="center">Title</TableCell>
              <TableCell align="center">URI</TableCell>
              <TableCell align="center">Created at</TableCell>
            </Fragment>

          </TableRow>
        </TableHead>
        <TableBody>
          {nfts?.map((nft) => (<NftRow nft={nft} key={nft.seller + nft.id} />  ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
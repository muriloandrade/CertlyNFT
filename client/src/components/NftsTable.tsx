import * as React from 'react';
import { Fragment } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button, Checkbox, Link, Stack, TextField, Typography } from '@mui/material';
import NFT from './NFT';
import { NftType } from '../pages/FinalConsumer'

function createData(
  id: number,
  amount: number
) {
  return { id, amount };
}

const rows = [
  createData(0, 30),
  createData(1, 15),
  createData(2, 20),
];

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
              <TableCell align="left">Media</TableCell>
              <TableCell align="left">URI</TableCell>
              <TableCell align="right"></TableCell>
            </Fragment>

          </TableRow>
        </TableHead>
        <TableBody>
          {nfts?.map((nft) => (
            <TableRow
              key={nft.seller + nft.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >

              <Fragment>
                <TableCell align='left'>
                  <NFT clientAddress={nft.seller} id={nft.id} />
                </TableCell>
                <TableCell align='left'>
                  <Typography color='grey'>
                    {/* <Link href={nft.uri?.replace("{id}", nft.id)}>{nft.uri?.replace("{id}", nft.id)}</Link> */}
                  </Typography>
                </TableCell>
                <TableCell align="right">Revert</TableCell>
              </Fragment>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
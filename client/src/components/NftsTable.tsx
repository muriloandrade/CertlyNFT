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

export enum Type {
  TOKEN,
  NFT
}


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

export default function NftsTable() {



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
          {rows.map((row) => (
            <TableRow
              key={row.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >

                <Fragment>
                  <TableCell align='left'><Typography color='grey'> NFT MEDIA
                    {/* <NFT clientAddress="0x123456789" id="4294967296" /> */}
                    </Typography></TableCell>
                  <TableCell align='left'><Typography color='grey'><Link href="www.nike.com/nfts/shoes/{4294967296}.json">www.nike.com/nfts/shoes/&#123;4294967296&#125;.json</Link></Typography></TableCell>
                  <TableCell align="right">Revert</TableCell>
                </Fragment>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
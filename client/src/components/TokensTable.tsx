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

export enum Type {
  TOKEN,
  NFT
}

interface TokensTableProps {
  type: Type;
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

export default function TokensTable(props: TokensTableProps) {

  return (
    <TableContainer component={Paper} sx={{ width: '50%' }}>
      <Table>
        <TableHead>
          <TableRow>
              <Fragment>
                <TableCell align='center'>ID</TableCell>
                <TableCell align="center">Stock</TableCell>
                <TableCell align="center">Amount</TableCell>
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
                  <TableCell align='center'>{row.id}</TableCell>
                  <TableCell align="center">{row.amount}</TableCell>
                  <TableCell align="center"><TextField size="small" sx={{ width: '15ch', bgcolor: "#181818" }} /></TableCell>
                </Fragment>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
import { Fragment } from 'react'
import TokensTable from '../components/TokensTable'
import { Type } from '../components/TokensTable'
import { Button, Divider, FilledInput, Input, OutlinedInput, Stack, TextField } from '@mui/material'
import NftsTable from '../components/NftsTable'
import FileUploader from '../components/FileUploader'

export default function FinalConsumer() {
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
          justifyContent="flex-end"
          alignItems="center"
          spacing={2}>
          <FileUploader />
          <TextField label="Password" size="small" type="password" sx={{ width: '15ch' }} />
          <Button variant="contained">Claim NFTs</Button>
        </Stack>
        <NftsTable />
      </Stack>
    </Fragment>
  )
}
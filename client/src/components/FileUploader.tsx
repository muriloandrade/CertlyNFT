import { Button } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import Web3 from 'web3';

type FileUpoloaderProps = {
  setInvoiceHash: Function;
}

export default function FileUploader(props: FileUpoloaderProps) {

  const { setInvoiceHash } = props

  const [file, setFile] = useState<File>();


  function onFileChange(event: ChangeEvent) {

    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;
    const reader = new FileReader();

    if (target && files && files.length > 0) {

      setFile(files[0]);
      reader.readAsText(files[0]);

      reader.onloadend = function () {
        const invoiceHash = Web3.utils.soliditySha3({ type: "string", value: reader.result as string });
        setInvoiceHash(invoiceHash);
      }
    }
  };

  return (
    <Button variant="outlined" component="label" sx={{ width: "30ch", color: "gray" }}>{file ? file.name : "Upload invoice file"}<input type="file" hidden onChange={(e) => onFileChange(e)} /></Button>
  )
}

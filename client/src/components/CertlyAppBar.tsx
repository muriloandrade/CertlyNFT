import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';

import { ConnectWallet, useSwitchAccount } from "@thirdweb-dev/react";

function CertlyAppBar() {

  const { switchAccount } = useSwitchAccount();

  // async function handleSwitchAccount() {
  //   // The wallet address to switch accounts to (assuming the user has logged in previously)
  //   const newWalletAddress = "0x...";
  //   await switchAccount(newWalletAddress);
  // }

  return (
    <AppBar position="static" sx={{ p: 2, mt: 3, mb: 3, borderRadius: 3 }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <a href="/">
            <img
              src="/images/certly_logo.png"
              alt="CertlyNFT logo"
              className="logo"
            />
          </a>


          <Box sx={{ flexGrow: 1, display: { xs: 'flex' } }} />

          <Box sx={{ flexGrow: 0 }}>
            <ConnectWallet
              theme="dark"
              btnTitle="Connect Wallet"
            />

          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default CertlyAppBar;
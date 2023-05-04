import {
  TokensLazyMinted,
  TokenURIRevealed,
  TokensClaimed,
  Transfer,
} from "../generated/DropERC721/DropERC721";
import {
  _handleLazyMint,
  _handleReveal,
  _handleNftTransfer,
  _handleTokenClaim,
} from "./nftContractHandlers";

export function handleLazyMint(event: TokensLazyMinted): void {
  _handleLazyMint(event);
}

export function handleReveal(event: TokenURIRevealed): void {
  _handleReveal(event);
}

export function handleNftTransfer(event: Transfer): void {
  _handleNftTransfer(event);
}

export function handleTokenClaim(event: TokensClaimed): void {
  _handleTokenClaim(event);
}

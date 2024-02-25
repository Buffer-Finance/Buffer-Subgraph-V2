import {
  Transfer as NFTtransfer,
  TokensClaimed,
  TokensLazyMinted,
} from "../generated/DropERC721/DropERC721";
import { TokenURIRevealed } from "../generated/OldDropERC721/DropERC721";
import {
  _handleLazyMint,
  _handleNftTransfer,
  _handleReveal,
  _handleTokenClaim,
} from "./nftContractHandlers";

export function handleNftTransfer(event: NFTtransfer): void {
  _handleNftTransfer(event);
}

export function handleTokenClaim(event: TokensClaimed): void {
  _handleTokenClaim(event);
}
export const handleReveal = (event: TokenURIRevealed): void => {
  _handleReveal(event);
};
export function handleLazyMint(event: TokensLazyMinted): void {
  _handleLazyMint(event);
}

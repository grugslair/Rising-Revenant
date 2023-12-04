//libs
import React, { useEffect } from "react";
import { HasValue,  getComponentValueStrict, Has } from "@latticexyz/recs";
import { useEntityQuery } from "@latticexyz/react";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { MenuState } from "./gamePhaseManager";
import { useDojo } from "../../hooks/useDojo";

//styles
import "./PagesStyles/WinnerPageStyles.css";

//elements/components
import { ClickWrapper } from "../clickWrapper";

//pages


/*notes
    this page should either have a way to get the winning user or just calc but it self (for now prob just calc it)
    and then depending on if the user is the winner or not it will display a different message


    should call the jackpot function
*/

interface WinnerPageProps {
    setMenuState: React.Dispatch<React.SetStateAction<MenuState>>;
}

export const WinnerPage: React.FC<WinnerPageProps> = ({ setMenuState }) => 
{
    const [winningAddress, setWinningAddress] = React.useState<string>("");

    const closePage = () => {
        setMenuState(MenuState.NONE);
    };

    const {
        account : { account },
        networkLayer: {
            network: { contractComponents },
        },
    } = useDojo();

  const outpostDeadQuery = useEntityQuery([HasValue(contractComponents.Outpost, { lifes: 0 })]);
  const totalOutposts = useEntityQuery([Has(contractComponents.Outpost)]);

  useEffect(() => {

    if (totalOutposts.length === 0) {
        setWinningAddress("No winner");
        return;
    }

    const difference: string[] = totalOutposts.filter(item => !outpostDeadQuery.includes(item));

    const outpostComp = getComponentValueStrict(contractComponents.Outpost, getEntityIdFromKeys([BigInt( difference[0])]));

    setWinningAddress(outpostComp.owner);

  }, []);

  const shareOnTwitter = () => {
    const message = 'I just won!';
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
    window.open(twitterShareUrl, '_blank');
  };

    return (
        <div className="winner-page-container">
                <div className="content-container">
                    <h3>Address: {winningAddress}</h3>
                    {winningAddress === account.address ? <h1>YOU ARE THE RISING REVENANT</h1> : <h1>IS THE RISING REVENANT</h1>}
                    <ClickWrapper className="button-style">Claim your jackpot</ClickWrapper>
                </div>

                {winningAddress === account.address && <div className="share-text" onMouseDown={() => {shareOnTwitter()}}>
                    <h2>Share on</h2>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg"></img>
                </div>}
        </div>
    )
}

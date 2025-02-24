import { HpTqCollection } from "./HpTqCollection";
import { GearDisplay } from "./GearDisplay";
import { useScreenDimensions } from "../../hooks/useScreenDimensions";
import { Utils } from "../../utility/Utils";

export interface EngineInfoProps {

}
export function EngineInfo(props: EngineInfoProps) {
  const size = useScreenDimensions();
  const width = Utils.getGraphWidth(size.dimensions.innerWidth);
  return (
    <div className="flex flex-col mt-4 mb-4">
      <GearDisplay />
      <HpTqCollection/>
    </div>
  )
}
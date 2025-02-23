import { HpTqCollection } from "./HpTqCollection";
import { GearDisplay } from "./GearDisplay";

export interface EngineInfoProps {

}
export function EngineInfo(props: EngineInfoProps) {
  return (
    <div className="flex flex-col inline-block mt-4 mb-4">
      <GearDisplay />
      <HpTqCollection/>
    </div>
  )
}


type FlagType = "string" | "bool" | "int" | "float"
type FlagValue = string | boolean | number

interface FlagDefinition {
  name: string,
  type: FlagType,
  description: string,
  deflt: FlagValue,
}

class FlagsRegistry {
  private readonly flags = {}

  public define(name: string, type: FlagType, description: string, deflt: FlagValue,) : void {
    // TODO: Validate flag.
    const defn = {name, type, description, deflt} as FlagDefinition;
    this.flags[name] = {defn, value:deflt}
  }

  public get(name: string) : FlagValue {
    const entry = this.flags[name]
    if (!entry) {
      throw new Error("Flag not found: " + name)
    }
    return entry.value
  }

  public dump() : void {
    console.log("<== flags ==>")
    console.log(this.flags)
    console.log("</== flags ==>")
  }
}

const flags = new FlagsRegistry()
export { flags }
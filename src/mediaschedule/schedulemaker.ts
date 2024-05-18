import { TaskRunner } from "../threads/taskrunner"

interface InitArgs {
  path: string
}

interface ScheduleMakerPayload {
  msg: string
}

class ScheduleMaker extends TaskRunner<ScheduleMakerPayload> {
  constructor({ path } : InitArgs) {
    super("ScheduleMaker")
    console.log("@Init path = " + path)
  }

  public run(args: ScheduleMakerPayload) {
    console.log('ScheduleMaker run $$$$$ ... ' + args.msg)
  }
}


export default ScheduleMaker
class TaskRunner<T> {
  readonly name: string;

  constructor(name: string) {
    this.name = name
  }

  run(args: T) {
    console.log("running task --- ")
  }
}

export { TaskRunner }
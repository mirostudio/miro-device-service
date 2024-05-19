class TaskRunner<T> {
  readonly name: string;

  constructor(name: string) {
    this.name = name
  }

  // @ts-ignore: no-unused-vars
  async runAsync(args: T) {
    console.log("running task --- ")

  }
}

export { TaskRunner }
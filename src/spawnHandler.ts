class SpawnHandler {
  constructor(private spawn: StructureSpawn) {}

  public run(): void {
    console.log(`Spawn ${this.spawn.name} in room ${this.spawn.room.name} is ready.`);
  }
}

export default SpawnHandler;

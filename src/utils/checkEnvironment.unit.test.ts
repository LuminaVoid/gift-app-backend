import checkEnvironment, { requiredEnvVars } from "./checkEnvironment.js";

const mockExit = vi.spyOn(process, "exit");
mockExit.mockImplementation(() => {
  return undefined as never;
});
const mockConsoleError = vi.spyOn(console, "info");
mockConsoleError.mockImplementation(() => {});

describe("checkEnvironment()", () => {
  afterAll(() => {
    mockConsoleError.mockReset();
  });

  afterEach(() => {
    process.env = {
      ...process.env,
      ...requiredEnvVars.reduce<Record<string, undefined>>((acc, varName) => {
        acc[varName] = undefined;
        return acc;
      }, {}),
    };
  });

  it("returns true if all required env vars are set", () => {
    process.env = {
      ...process.env,
      ...requiredEnvVars.reduce<Record<string, string>>((acc, varName) => {
        acc[varName] = `some-${varName}-value`;
        return acc;
      }, {}),
    };
    expect(checkEnvironment()).toBe(true);
  });

  it.each(
    requiredEnvVars
      .reduce<string[][]>(
        (acc, cur) => {
          return [...acc, ...acc.map((c) => [...c, cur])];
        },
        [[]]
      )
      .map((c) => [c])
      .slice(1)
  )("terminates process if any of %s are missing", (missingEnvVars) => {
    process.env = {
      ...process.env,
      ...requiredEnvVars.reduce<Record<string, string | undefined>>(
        (acc, varName) => {
          acc[varName] = missingEnvVars.includes(varName)
            ? undefined
            : `some-${varName}-value`;
          return acc;
        },
        {}
      ),
    };
    checkEnvironment();
    expect(mockExit).toBeCalled();
  });
});

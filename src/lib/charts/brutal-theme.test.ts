import { BrutalTheme } from './brutal-theme';

// Mock amCharts
jest.mock("@amcharts/amcharts5", () => {
  return {
    Theme: class {
      constructor(root: any) {
        (this as any)._root = root;
      }
      rule(name: string) {
        return {
          setAll: jest.fn(),
        };
      }
    },
    color: jest.fn(),
    RoundedRectangle: { new: jest.fn() },
  };
});

describe('BrutalTheme', () => {
  it('should be instantiable', () => {
    const root = { _root: true };
    const theme = new BrutalTheme(root as any);
    expect(theme).toBeInstanceOf(BrutalTheme);
  });

  it('should setup default rules', () => {
    const root = { _root: true };
    const theme = new BrutalTheme(root as any);
    
    // Spy on the rule method
    const ruleSpy = jest.spyOn(theme, 'rule');
    
    theme.setupDefaultRules();
    
    expect(ruleSpy).toHaveBeenCalledWith("InterfaceColors");
    expect(ruleSpy).toHaveBeenCalledWith("Label");
    expect(ruleSpy).toHaveBeenCalledWith("ColorSet");
    expect(ruleSpy).toHaveBeenCalledWith("Grid");
  });
});

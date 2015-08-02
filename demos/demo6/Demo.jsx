/* eslint-disable no-unused-vars, no-eval */

// webpack trying to bundle babel errors, haven't checked why too much
import babel from 'babel-browser-transform/dist/babel-browser-transform';
import CodeMirror from 'react-codemirror';
// React and Spring are transpiled into other names, but the evals in the
// component need to refer to the original names. Forunately babel doesn't
// transform the `require`s into different names too
const React = require('react');
const {Spring} = require('../../src/Spring');
// loads js syntax
import 'codemirror/mode/javascript/javascript';
import l from '../../src/log';

const codeMirrorOpts = {
  mode: 'javascript',
  lineNumbers: true,
  lineWrapping: true,
  // javascript mode does bad things with jsx indents last time I checked
  smartIndent: false,
  matchBrackets: true,
  theme: 'monokai',
};

const Example = React.createClass({
  propTypes: {
    code: React.PropTypes.string.isRequired,
  },

  getInitialState() {
    return {code: this.props.code};
  },

  componentDidMount() {
    this.evalCode();
  },

  componentDidUpdate() {
    this.evalCode();
  },

  evalCode() {
    const {code} = this.state;
    const mountNode = React.findDOMNode(this.refs.mountNode);
    if (code === '') {
      React.render(<div>Display here</div>, mountNode);
      return;
    }

    try {
      const jsCode = babel.transform(code).code;
      eval(jsCode);
    } catch (e) {
      React.render(
        <div className="demo6-error">{e.message.split('\n')[0]}</div>,
        mountNode,
      );
    }
  },

  updateCode(code) {
    this.setState({code});
  },

  render() {
    return (
      <div style={{
        outline: '1px solid red',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <div style={{
          outline: '1px solid black',
          width: 600,
        }}>
          <CodeMirror
            value={this.state.code}
            onChange={this.updateCode}
            options={codeMirrorOpts} />
        </div>

        <div style={{
          outline: '1px solid green',
          width: 280,
        }}>
          <div ref="mountNode" />
        </div>

      </div>
    );
  },
});

const Demo = React.createClass({
  getInitialState() {
    // TODO: hightlight that cursor position after 1`
    return {
      headerCode:
`const Demo = React.createClass({
  render() {
    return (
      <Spring defaultValue={0} endValue={1}>
        {val =>
          <div style={{transform: \`scale(\${val})\`}}>
            React-motion
          </div>
        }
      </Spring>
    );
  },
});

React.render(<Demo />, headerText);
`,
    };
  },

  componentDidMount() {
    this.evalCode();
  },

  componentDidUpdate() {
    this.evalCode();
  },

  evalCode() {
    const headerText = React.findDOMNode(this.refs.headerText);
    const {headerCode} = this.state;
    if (headerCode === '') {
      React.render(<div>Display here</div>, headerText);
      return;
    }

    try {
      const jsCode = babel.transform(headerCode).code;
      eval(jsCode);
    } catch (e) {
      React.render(
        <div className="demo6-error">{e.message.split('\n')[0]}</div>,
        headerText,
      );
    }
  },

  updateCode(code) {
    this.setState({headerCode: code});
  },

  render() {
    const {headerCode, example1} = this.state;

    return (
      <div>
        <div className="nav-main" style={{
          width: '100%',
          outline: '1px solid black',
          display: 'flex',
          justifyContent: 'center',
          height: 50,
        }}>
          <div className="nav-inner" style={{
            width: 920,
            padding: '0 20px 0 20px',
            outline: '1px solid red',
            display: 'flex',
            justifyContent: 'flex-end',
          }}>
            <div style={{
              padding: '0 10px',
              lineHeight: '50px',
            }}>
              Docs
            </div>
            <div style={{
              padding: '0 10px',
              lineHeight: '50px',
            }}>
              Support
            </div>
            <div style={{
              padding: '0 10px',
              lineHeight: '50px',
            }}>
              Github
            </div>
          </div>
        </div>

        <div style={{
          outline: '1px solid red',
          padding: '50px 0 50px 0',
        }}>
          <div ref="headerText" style={{
            display: 'flex',
            justifyContent: 'center',
            fontWeight: 400,
            fontSize: '64px',
          }} />

          <div style={{
            textAlign: 'center',
          }}>
            A SPRING THAT SOLVES YOUR ANIMATION PROBLEMS
          </div>


          <div style={{
            width: 600,
            margin: '60px auto 0 auto',
          }}>
            <CodeMirror
              value={headerCode}
              onChange={this.updateCode}
              options={codeMirrorOpts} />
          </div>

        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{
            width: 960,
          }}>
            <div style={{
              outline: '1px solid black',
              margin: '50px auto 50px auto',
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <div style={{
                width: 280,
                outline: '1px solid green',
                // marginRight: 40,
              }}>
                <div style={{
                  fontSize: 24,
                  margin: '10px 0 10px 0',
                }}>
                  asd
                </div>
                <div style={{
                  margin: '10px 0 10px 0',
                  fontSize: '16px',
                }}>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Impedit obcaecati, provident modi. Aspernatur placeat dolorum architecto dolorem rerum nesciunt, mollitia veniam incidunt. Doloribus harum earum, similique debitis pariatur dolore quam.
                </div>
              </div>
              <div style={{
                width: 280,
                outline: '1px solid green',
                // marginRight: 40,
              }}>
                <div style={{
                  fontSize: 24,
                  margin: '10px 0 10px 0',
                  // marginRight: 40,
                }}>
                  asd
                </div>
                <div style={{
                  margin: '10px 0 10px 0',
                  fontSize: '16px',
                }}>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quod ex omnis, culpa quisquam eveniet quis nostrum deleniti et recusandae nulla tempore libero similique ipsum vel, accusantium nam, ullam provident non.
                </div>
              </div>
              <div style={{
                width: 280,
                outline: '1px solid green',
              }}>
                <div style={{
                  fontSize: 24,
                  margin: '10px 0 10px 0',
                }}>
                  asd
                </div>
                <div style={{
                  margin: '10px 0 10px 0',
                  fontSize: '16px',
                }}>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias neque tempore fuga distinctio enim cum labore, vitae dolorem. Nesciunt, dignissimos, voluptas. Nesciunt officia modi molestias, illo dolorem saepe autem earum!
                </div>
              </div>
            </div>

            <hr style={{
              borderTopColor: 'black',
              width: 400,
            }}/>

            <div>
              <div style={{
                marginTop: 60,
                // display: 'flex',
              }}>
                <div style={{
                  outline: '1px solid green',
                  width: 600,
                }}>
                  <div style={{
                    fontSize: '24px',
                    marginBottom: 5,
                  }}>
                    A Simple Component
                  </div>
                  <div style={{
                    margin: '0 0 25px 0',
                  }}>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maiores totam, dolorum sunt aperiam nisi consequuntur soluta nostrum beatae qui error dolorem pariatur numquam eaque sint, debitis, aliquam quod, reprehenderit expedita.
                  </div>
                </div>

                <Example code={example1} />

              </div>
            </div>

          </div>
        </div>
      </div>
    );
  },
});

export default Demo;

import * as React from "react";
//import MaterialIcon from "@material/react-material-icon";
import axios from "axios";
import "@material/react-text-field/dist/text-field.css";
import Form from "./Form";
import "../styles/Wgs.css";
import FormParameters from "../FormParameters";
import WgsTable, { Record as TableProps } from "./WgsTable";
import { Props as FormProps } from "./Form";

interface State {
  formParameters: FormProps;
  tableData: TableProps[];
  page: number;
}

export default class Wgs extends React.Component<object, State> {
  constructor(_: object) {
    super(_);
    this.state = {
      formParameters: FormParameters,
      tableData: [{ variants: [], genes: [] }],
      page: 0
    };
  }

  componentDidMount() {
    axios.get("/combo").then(res => {
      this.setState({
        tableData: res.data.data.map((d: any) => {
          return { variants: d.variants, genes: d.genes };
        })
      });
    });
  }

  onChange = (e: any) => {
    // update value of cutoffs
    if (e.target.name === "sortKey") {
      // this one is special, need to deal separately
      const sortKey = {
        ...this.state.formParameters.sortKey,
        value: e.target.value
      };
      this.setState({
        formParameters: { ...this.state.formParameters, sortKey }
      });
    } else {
      const filters = this.state.formParameters.filters.map(d => {
        if (d.key === e.target.name) {
          // update choices if type == checkbox
          let choices: Array<any> = [],
            value =
              e.target.value.match(/^ *$/) !== null ? null : e.target.value;
          if (d.type === "checkbox") {
            choices = d.choices.map(c => {
              if (c.value === e.target.value) {
                if (c.checked) {
                  value = null;
                }
                return { ...c, checked: !c.checked };
              }
              return c;
            });
          }
          return { ...d, value, choices };
        } else {
          return d;
        }
      });
      this.setState({
        formParameters: { ...this.state.formParameters, filters }
      });
    }
  };

  onPageChange = (n: number) => {
    axios.get(`/combo/page/${n}`).then(res => {
      this.setState({
        tableData: res.data.data.map((d: any) => {
          return { variants: d.variants, genes: d.genes };
        }),
        page: this.state.page + n
      });
    });
  };
  onSubmit = (e: any) => {
    e.preventDefault();
    // get our form data out of state
    const { formParameters } = this.state;

    axios.post("/combo", { formParameters }).then(res => {
      this.setState({
        tableData: res.data.data.map((d: any) => {
          return { variants: d.variants, genes: d.genes };
        })
      });
    });
  };
  render() {
    const { formParameters, tableData, page } = this.state;
    return (
      <React.Fragment>
        <div className="sidebar">
          <Form
            onSubmit={this.onSubmit}
            onChange={this.onChange}
            filters={formParameters.filters}
            skip={formParameters.skip}
            limit={formParameters.limit}
            sortKey={formParameters.sortKey}
          />
        </div>
        <div className="table">
          <WgsTable
            data={tableData}
            onPageChange={this.onPageChange}
            page={page}
          />
        </div>
      </React.Fragment>
    );
  }
}

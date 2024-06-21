import React, { useState } from "react"
import {
  Layout,
  Form,
  InputNumber,
  Select,
  Button,
  Typography,
  Row,
  Col,
  Card,
  Alert,
  Space,
} from "antd"
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons"
import "./App.css"

const { Header, Content, Footer } = Layout
const { Title } = Typography
const { Option } = Select

const App = () => {
  const [results, setResults] = useState(null)
  const [form] = Form.useForm()

  const handleGrainChange = (index, value) => {
    const currentFlours = form.getFieldValue("flours")
    currentFlours[index].flourType = undefined
    form.setFieldsValue({ flours: currentFlours })
  }

  const calculateDough = (values) => {
    const { flours, temperature } = values
    let totalFlourAmount = 0
    let totalWater = 0
    let totalSalt = 0
    let totalYeast = 0
    let totalProtein = 0
    let waterRatio = 1

    flours.forEach((flour) => {
      const { flourAmount, proteinContent, flourType } = flour
      totalFlourAmount += flourAmount

      // // Calcola l'acqua basata sul contenuto di proteine e sul tipo di farina
      // let waterRatio = 0.6 + ((proteinContent - 10) / 10) * 0.4

      if (flourType === "integrale") {
        waterRatio = 1.02 // Aggiungi 2% di acqua per la farina integrale
      }

      // // Calcola l'acqua effettiva necessaria in base alla quantità di farina e al rapporto di acqua aggiustato
      // const flourWater = flourAmount * waterRatio
      // totalWater += flourWater

      console.log("proteinContent", proteinContent)

      console.log("current proteins = ", flourAmount * (proteinContent / 100))

      totalProtein += flourAmount * (proteinContent / 100)

      console.log("flour amount = ", flourAmount)

      console.log("total protein = ", totalProtein)

      totalSalt += flourAmount * 0.02

      let baseYeast = flourAmount * 0.2 // Base 20% della quantità di farina

      // Regola la quantità di lievito in base alla temperatura
      if (temperature < 10) {
        baseYeast *= 1.2 // Aumento del 20% per temperature molto basse
      } else if (temperature < 20) {
        baseYeast *= 1 + (20 - temperature) / 50 // Aumento gradualmente con temperature sotto i 20°C
      } else if (temperature < 30) {
        baseYeast *= 1 - (temperature - 20) / 20 // Decremento gradualmente con temperature sopra i 20°C
      } else {
        baseYeast *= 0.5 // Riduzione del 50% per temperature molto alte
      }

      // Assicurati che la quantità di lievito non sia mai inferiore a 0
      baseYeast = Math.max(baseYeast, 0)

      totalYeast += baseYeast
    })

    // Calcola il tempo di lievitazione in base alla temperatura
    let riseTime
    if (temperature < 10) {
      riseTime = "36 ore"
    } else if (temperature < 15) {
      riseTime = "24 ore"
    } else if (temperature < 20) {
      riseTime = "18 ore"
    } else if (temperature < 25) {
      riseTime = "12 ore"
    } else if (temperature < 30) {
      riseTime = "8 ore"
    } else if (temperature < 35) {
      riseTime = "6 ore"
    } else {
      riseTime = "4 ore"
    }

    const proteinRatio =
      (totalProtein / (totalFlourAmount - totalProtein)) * 100

    console.log("proteinRatio", proteinRatio)

    if (proteinRatio < 10) {
      totalWater = totalFlourAmount * 0.6
    }

    if (proteinRatio >= 10 && proteinRatio < 11) {
      totalWater = totalFlourAmount * 0.65
    }

    if (proteinRatio >= 11 && proteinRatio < 12) {
      totalWater = totalFlourAmount * 0.7
    }

    if (proteinRatio >= 12 && proteinRatio < 13) {
      totalWater = totalFlourAmount * 0.75
    }

    if (proteinRatio >= 13 && proteinRatio < 14) {
      totalWater = totalFlourAmount * 0.8
    }

    if (proteinRatio >= 14 && proteinRatio < 15) {
      totalWater = totalFlourAmount * 0.85
    }

    if (proteinRatio >= 15 && proteinRatio < 16) {
      totalWater = totalFlourAmount * 0.9
    }

    if (proteinRatio >= 16) {
      totalWater = totalFlourAmount * 0.9
    }

    totalWater = totalWater * waterRatio

    totalWater = totalWater.toFixed(2)

    // Imposta i risultati con i valori calcolati
    setResults({
      totalFlourAmount,
      totalWater,
      totalSalt,
      totalYeast: totalYeast > 100 ? 100 : totalYeast < 50 ? 50 : totalYeast,
      riseTime,
    })
  }

  return (
    <Layout>
      <Header
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Title style={{ color: "white", textAlign: "center" }}>
          Bread Dough Calculator
        </Title>
      </Header>
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          flexDirection: "column",
          width: "100%",
        }}
      >
        <div className="container">
          <div className="form-box">
            <Form
              layout="vertical"
              form={form}
              onFinish={calculateDough}
              initialValues={{
                flours: [
                  {
                    flourKind: undefined,
                    flourType: undefined,
                    flourAmount: 0,
                    proteinContent: 0,
                  },
                ],
              }}
            >
              <Form.List name="flours">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field, index) => (
                      <div key={field.key} className="flour-box">
                        <Space
                          align="baseline"
                          style={{ display: "flex", marginBottom: 8 }}
                        >
                          <Form.Item
                            {...field}
                            name={[field.name, "flourKind"]}
                            fieldKey={[field.fieldKey, "flourKind"]}
                            label="Tipo di Grano"
                            rules={[
                              {
                                required: true,
                                message: "Seleziona il tipo di grano!",
                              },
                            ]}
                          >
                            <Select
                              style={{ width: 200 }}
                              placeholder="Seleziona il tipo di grano"
                              onChange={(value) =>
                                handleGrainChange(index, value)
                              }
                            >
                              <Option value="grano duro">Grano Duro</Option>
                              <Option value="grano tenero">Grano Tenero</Option>
                              <Option value="glutine puro">Glutine Puro</Option>
                            </Select>
                          </Form.Item>

                          <Form.Item
                            {...field}
                            name={[field.name, "flourType"]}
                            fieldKey={[field.fieldKey, "flourType"]}
                            label="Tipo di Farina"
                            rules={[
                              {
                                required: true,
                                message: "Seleziona il tipo di farina",
                              },
                            ]}
                          >
                            <Select
                              style={{ width: 200 }}
                              placeholder="Seleziona il tipo di farina"
                            >
                              {form.getFieldValue([
                                "flours",
                                index,
                                "flourKind",
                              ]) === "grano duro" ? (
                                <>
                                  <Option value="integrale">Integrale</Option>
                                  <Option value="tipo 2">Tipo 2</Option>
                                  <Option value="tipo 1">Tipo 1</Option>
                                </>
                              ) : form.getFieldValue([
                                  "flours",
                                  index,
                                  "flourKind",
                                ]) === "grano tenero" ? (
                                <>
                                  <Option value="integrale">Integrale</Option>
                                  <Option value="tipo 2">Tipo 2</Option>
                                  <Option value="tipo 1">Tipo 1</Option>
                                  <Option value="0">0</Option>
                                  <Option value="00">00</Option>
                                </>
                              ) : (
                                <Option value="integrale">Glutine Puro</Option>
                              )}
                            </Select>
                          </Form.Item>

                          <Form.Item
                            {...field}
                            name={[field.name, "proteinContent"]}
                            fieldKey={[field.fieldKey, "proteinContent"]}
                            label="Contenuto di Proteine (%)"
                            rules={[
                              {
                                required: true,
                                message: "Inserisci il contenuto di proteine!",
                              },
                            ]}
                          >
                            <InputNumber
                              min={0}
                              max={100}
                              placeholder="Inserisci il contenuto di proteine"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>

                          <Form.Item
                            {...field}
                            name={[field.name, "flourAmount"]}
                            fieldKey={[field.fieldKey, "flourAmount"]}
                            label="Quantità di Farina (g)"
                            rules={[
                              {
                                required: true,
                                message: "Inserisci la quantità di farina!",
                              },
                            ]}
                          >
                            <InputNumber
                              min={0}
                              placeholder="Inserisci la quantità di farina"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>

                          <DeleteOutlined onClick={() => remove(field.name)} />
                        </Space>
                      </div>
                    ))}

                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Aggiungi Farina
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>

              <Form.Item
                name="temperature"
                label="Temperatura dell'Ambiente (°C)"
                rules={[
                  { required: true, message: "Inserisci la temperatura!" },
                ]}
              >
                <InputNumber
                  min={-10}
                  max={50}
                  placeholder="Inserisci la temperatura dell'ambiente"
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Calcola
                </Button>
              </Form.Item>
            </Form>
          </div>

          {results && (
            <div className="results-box">
              <Title level={4}>Risultati</Title>
              <Alert
                message={`Totale Polveri: ${results.totalFlourAmount} g`}
                type="info"
                showIcon
              />
              <Alert
                message={`Acqua: ${results.totalWater} g`}
                type="info"
                showIcon
              />
              <Alert
                message={`Sale: ${results.totalSalt} g`}
                type="info"
                showIcon
              />
              <Alert
                message={`Lievito Madre: ${results.totalYeast} g`}
                type="info"
                showIcon
              />
              <Alert
                message={`Tempo di Lievitazione: ${results.riseTime}`}
                type="info"
                showIcon
              />
            </div>
          )}
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Bread Dough Calculator ©2024
      </Footer>
    </Layout>
  )
}

export default App

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

    flours.forEach((flour) => {
      const { flourAmount, proteinContent, flourType } = flour
      totalFlourAmount += flourAmount

      // Calculate water based on protein content
      let waterRatio = 0.6 + ((proteinContent - 10) / 10) * 0.4

      if (flourType === "integrale") {
        waterRatio += 0.02 // Aggiungi 2% di acqua per la farina integrale
      }

      // Calculate actual water needed based on flour amount and adjusted water ratio
      const flourWater = flourAmount * waterRatio
      totalWater += flourWater

      totalSalt += flourAmount * 0.02

      // Calculate the amount of yeast
      const baseYeast = flourAmount * 0.2 // Base 20% of flour amount
      const adjustedYeast = temperature < 20 ? baseYeast * 1.5 : baseYeast // Increase by 50% if temperature is below 20°C
      totalYeast += adjustedYeast
    })

    const riseTime = temperature < 20 ? "24 ore" : "12 ore"

    // Assuming setResults is a placeholder for setting the calculated values somewhere else
    setResults({
      totalFlourAmount,
      totalWater,
      totalSalt,
      totalYeast,
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
                                message: "Seleziona il tipo di farina!",
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
                              ) : (
                                <>
                                  <Option value="integrale">Integrale</Option>
                                  <Option value="tipo 2">Tipo 2</Option>
                                  <Option value="tipo 1">Tipo 1</Option>
                                  <Option value="0">0</Option>
                                  <Option value="00">00</Option>
                                </>
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
                message={`Totale Farina: ${results.totalFlourAmount} g`}
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

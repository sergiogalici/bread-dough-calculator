import React, { useEffect, useState } from "react"
import {
  Layout,
  Form,
  InputNumber,
  Select,
  Button,
  Typography,
  Space,
  Modal,
  Alert,
} from "antd"
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons"
import "./App.css"
import { calculateDough } from "./utils/results"

const { Header, Content, Footer } = Layout
const { Title } = Typography
const { Option } = Select

const App = () => {
  const [results, setResults] = useState(null)
  const [form] = Form.useForm()
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedFlourKind, setSelectedFlourKind] = useState(undefined)

  console.log("selected flour kind:", selectedFlourKind)
  console.log("is flour corn = ", selectedFlourKind === "farina di mais")

  const handleModalOk = () => {
    setModalVisible(false)
    setResults(null)
    form.resetFields()
  }

  const handleModalCancel = () => {
    setModalVisible(false)
  }

  return (
    <Layout>
      <Header
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 250,
        }}
      >
        <Title style={{ color: "white", textAlign: "center" }}>
          🥖 Sourdough Bread Calculator 🍞
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
              onFinish={(values) => {
                calculateDough(values, setResults, setModalVisible)
              }}
              initialValues={{
                flours: [
                  {
                    flourKind: undefined,
                    flourAmount: 0,
                    proteinContent: 0,
                    fiberContent: 0,
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
                            label="Type of flour"
                            rules={[
                              {
                                required: true,
                                message: "Choose your flour type",
                              },
                            ]}
                          >
                            <Select
                              style={{ width: 200 }}
                              placeholder="Choose flour type"
                              onChange={(value) => {
                                setSelectedFlourKind(value)
                                form.setFieldsValue({
                                  [`flours[${index}].proteinContent`]:
                                    undefined,
                                })
                              }}
                            >
                              <Option value="grano duro">Durum Wheat</Option>
                              <Option value="grano tenero">Soft Wheat</Option>
                              <Option value="farina di mais">Cornmeal</Option>
                              <Option value="farina di farro">Spelt</Option>
                              <Option value="farina di segale">Rye</Option>
                              <Option value="farina di riso">Rice</Option>
                            </Select>
                          </Form.Item>

                          <Form.Item
                            {...field}
                            name={[field.name, "proteinContent"]}
                            fieldKey={[field.fieldKey, "proteinContent"]}
                            label="Protein Content"
                            style={{ width: 200 }}
                            rules={[
                              {
                                required: true,
                                message: "Insert your flour's protein content",
                              },
                            ]}
                          >
                            <InputNumber
                              min={0}
                              max={100}
                              placeholder="Insert your flour water content"
                              style={{ width: "100%" }}
                              addonAfter="%"
                              inputMode="numeric"
                              datatype="number"
                            />
                          </Form.Item>

                          <Form.Item
                            {...field}
                            name={[field.name, "fiberContent"]}
                            fieldKey={[field.fieldKey, "fiberContent"]}
                            label="Fiber Content"
                            style={{ width: 200 }}
                            rules={[
                              {
                                required: true,
                                message: "Insert your flout fiber content",
                              },
                            ]}
                          >
                            <InputNumber
                              min={0}
                              max={100}
                              placeholder="Insert your flour's fiber content"
                              style={{ width: "100%" }}
                              addonAfter="%"
                              inputMode="numeric"
                              datatype="number"
                            />
                          </Form.Item>

                          <Form.Item
                            {...field}
                            name={[field.name, "flourAmount"]}
                            fieldKey={[field.fieldKey, "flourAmount"]}
                            label="Flour amount"
                            style={{ width: 200 }}
                            rules={[
                              {
                                required: true,
                                message: "Insert your flour amount in grams",
                              },
                            ]}
                          >
                            <InputNumber
                              min={0}
                              placeholder="Insert your flour amount in grams"
                              style={{ width: "100%" }}
                              addonAfter="g"
                              inputMode="numeric"
                              datatype="number"
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
                        Add another flour to the mix
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>

              <Form.Item
                name="temperature"
                label="Room temperature (°C)"
                rules={[
                  { required: true, message: "Insert your room temperature" },
                ]}
                initialValue={25}
              >
                <InputNumber
                  min={-10}
                  max={50}
                  placeholder="Insert your room temperature"
                  style={{ width: "100%" }}
                  defaultValue={25}
                  addonAfter="°C"
                  inputMode="numeric"
                  datatype="number"
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Calculate
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Bread Calculator - Macco di Favole 2024
      </Footer>

      <Modal
        title="Results"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        style={{ gap: 20 }}
        okText="New mix"
        cancelText="Back to your mix"
      >
        {results && results.totalFlourAmount > 0 ? (
          <div className="results-box">
            <Alert
              message={`Total flour: ${results.totalFlourAmount} g`}
              type="info"
              showIcon
            />
            <Alert
              message={`W rating: ${results.wRating}`}
              type="info"
              showIcon
            />
            <Alert
              message={`Water: ${results.totalWater} g`}
              type="info"
              showIcon
            />
            <Alert
              message={`Salt: ${results.totalSalt} g`}
              type="info"
              showIcon
            />
            <Alert
              message={`Sourdough starter: ${results.totalYeast} g`}
              type="info"
              showIcon
            />
            <Alert
              message={`Proofing time: ${results.riseTime}`}
              type="info"
              showIcon
            />
            <Alert
              message={`Fiber content: ${results.fiberRatio} %`}
              type="info"
              showIcon
            />
            <Alert
              message={`Glycemic index: ${results.glycemicIndex}`}
              type="info"
              showIcon
            />
          </div>
        ) : (
          <Alert message="Invalid Input" type="error" />
        )}
      </Modal>
    </Layout>
  )
}

export default App
